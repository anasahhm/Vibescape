const Lounge = require('../models/Lounge');

module.exports = (io, socket) => {
  
  // Join a lounge room
  socket.on('joinRoom', async (data) => {
    try {
      const { loungeId } = data;
      
      // Verify user is member of lounge
      const lounge = await Lounge.findById(loungeId);
      if (!lounge || !lounge.members.includes(socket.userId)) {
        socket.emit('error', { message: 'Not authorized to join this lounge' });
        return;
      }

      socket.join(loungeId);
      console.log(`User ${socket.userId} joined lounge ${loungeId}`);
      
      // Notify others in the room
      socket.to(loungeId).emit('userJoinedRoom', {
        userId: socket.userId
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a lounge room
  socket.on('leaveRoom', (data) => {
    const { loungeId } = data;
    socket.leave(loungeId);
    
    socket.to(loungeId).emit('userLeftRoom', {
      userId: socket.userId
    });
  });

  // Send chat message
  socket.on('sendMessage', async (data) => {
    try {
      const { loungeId, message } = data;
      
      // Verify user is member of lounge
      const lounge = await Lounge.findById(loungeId);
      if (!lounge || !lounge.members.includes(socket.userId)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      const User = require('../models/User');
      const user = await User.findById(socket.userId).select('displayName profileImage');

      const messageData = {
        id: Date.now().toString(),
        userId: socket.userId,
        user: {
          displayName: user.displayName,
          profileImage: user.profileImage
        },
        message: message.trim(),
        timestamp: new Date()
      };

      // Broadcast to all users in the lounge
      io.to(loungeId).emit('newMessage', messageData);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // User is typing
  socket.on('typing', (data) => {
    const { loungeId, isTyping } = data;
    socket.to(loungeId).emit('userTyping', {
      userId: socket.userId,
      isTyping
    });
  });

  // Now playing update
  socket.on('nowPlaying', (data) => {
    const { loungeId, track, position } = data;
    socket.to(loungeId).emit('nowPlayingUpdate', {
      track,
      position,
      userId: socket.userId
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
};