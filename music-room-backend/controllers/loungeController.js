const Lounge = require('../models/Lounge');
const Song = require('../models/Song');
const generateCode = require('../utils/generateCode');
const { getIO } = require('../config/socket');

// Create a new lounge
exports.createLounge = async (req, res) => {
  try {
    const { name, maxMembers } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Lounge name is required' });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await Lounge.findOne({ code });
      if (!existing) isUnique = true;
    }

    const lounge = await Lounge.create({
      name: name.trim(),
      code,
      creator: req.user._id,
      members: [req.user._id],
      maxMembers: maxMembers || 50
    });

    const populatedLounge = await Lounge.findById(lounge._id)
      .populate('creator', 'displayName profileImage')
      .populate('members', 'displayName profileImage');

    res.status(201).json({ lounge: populatedLounge });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lounge' });
  }
};

// Get all active lounges
exports.getAllLounges = async (req, res) => {
  try {
    const lounges = await Lounge.find({ isActive: true })
      .populate('creator', 'displayName profileImage')
      .populate('members', 'displayName profileImage')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ lounges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get lounges' });
  }
};

// Get user's lounges
exports.getMyLounges = async (req, res) => {
  try {
    const lounges = await Lounge.find({
      members: req.user._id,
      isActive: true
    })
      .populate('creator', 'displayName profileImage')
      .populate('members', 'displayName profileImage')
      .sort({ updatedAt: -1 });

    res.json({ lounges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get lounges' });
  }
};

// Join a lounge by code
exports.joinLounge = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Lounge code is required' });
    }

    const lounge = await Lounge.findOne({ code: code.toUpperCase(), isActive: true });

    if (!lounge) {
      return res.status(404).json({ error: 'Lounge not found' });
    }

    if (lounge.members.length >= lounge.maxMembers) {
      return res.status(400).json({ error: 'Lounge is full' });
    }

    if (!lounge.members.includes(req.user._id)) {
      lounge.members.push(req.user._id);
      await lounge.save();
    }

    const populatedLounge = await Lounge.findById(lounge._id)
      .populate('creator', 'displayName profileImage')
      .populate('members', 'displayName profileImage');

    // Emit socket event
    const io = getIO();
    io.to(lounge._id.toString()).emit('memberJoined', {
      member: {
        _id: req.user._id,
        displayName: req.user.displayName,
        profileImage: req.user.profileImage
      }
    });

    res.json({ lounge: populatedLounge });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join lounge' });
  }
};

// Get lounge details
exports.getLoungeDetails = async (req, res) => {
  try {
    const lounge = await Lounge.findById(req.params.id)
      .populate('creator', 'displayName profileImage')
      .populate('members', 'displayName profileImage');

    if (!lounge) {
      return res.status(404).json({ error: 'Lounge not found' });
    }

    // Get playlist
    const playlist = await Song.find({ loungeId: lounge._id })
      .populate('addedBy', 'displayName profileImage')
      .sort({ votes: -1, createdAt: 1 });

    res.json({ lounge, playlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get lounge details' });
  }
};

// Leave a lounge
exports.leaveLounge = async (req, res) => {
  try {
    const lounge = await Lounge.findById(req.params.id);

    if (!lounge) {
      return res.status(404).json({ error: 'Lounge not found' });
    }

    lounge.members = lounge.members.filter(
      member => member.toString() !== req.user._id.toString()
    );

    // If creator leaves and there are other members, transfer ownership
    if (lounge.creator.toString() === req.user._id.toString() && lounge.members.length > 0) {
      lounge.creator = lounge.members[0];
    }

    // If no members left, deactivate lounge
    if (lounge.members.length === 0) {
      lounge.isActive = false;
    }

    await lounge.save();

    // Emit socket event
    const io = getIO();
    io.to(lounge._id.toString()).emit('memberLeft', {
      userId: req.user._id
    });

    res.json({ message: 'Left lounge successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave lounge' });
  }
};

// Delete a lounge
exports.deleteLounge = async (req, res) => {
  try {
    const lounge = await Lounge.findById(req.params.id);

    if (!lounge) {
      return res.status(404).json({ error: 'Lounge not found' });
    }

    if (lounge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can delete the lounge' });
    }

    lounge.isActive = false;
    await lounge.save();

    // Delete all songs in the lounge
    await Song.deleteMany({ loungeId: lounge._id });

    // Emit socket event
    const io = getIO();
    io.to(lounge._id.toString()).emit('loungeDeleted');

    res.json({ message: 'Lounge deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lounge' });
  }
};