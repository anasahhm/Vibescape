import { useState, useEffect, useRef } from 'react';
import { useSocket as useSocketContext } from '../../context/SocketContext';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { formatTime, getInitials, getAvatarColor } from '../../utils/helpers';

const ChatBox = ({ loungeId, members }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, sendTyping } = useSocketContext();
  const { user } = useAuth();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event handlers
  useSocket('newMessage', (data) => {
    setMessages(prev => [...prev, data]);
  });

  useSocket('userTyping', (data) => {
    if (data.isTyping) {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    } else {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    }
  });

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Send typing indicator
    sendTyping(loungeId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(loungeId, false);
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendMessage(loungeId, inputMessage);
    setInputMessage('');
    sendTyping(loungeId, false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const getTypingText = () => {
    const typingList = Array.from(typingUsers);
    if (typingList.length === 0) return '';
    
    const typingMembers = members
      .filter(m => typingList.includes(m._id))
      .map(m => m.displayName);

    if (typingMembers.length === 1) {
      return `${typingMembers[0]} is typing...`;
    } else if (typingMembers.length === 2) {
      return `${typingMembers[0]} and ${typingMembers[1]} are typing...`;
    } else {
      return 'Several people are typing...';
    }
  };

  return (
    <div className="bg-spotify-gray rounded-lg flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-spotify-black">
        <h2 className="text-xl font-bold text-white">Chat</h2>
        <p className="text-spotify-lightGray text-sm">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-spotify-lightGray">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.userId === user._id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                {!isOwnMessage && (
                  <div className="flex-shrink-0">
                    {msg.user.profileImage ? (
                      <img
                        src={msg.user.profileImage}
                        alt={msg.user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(msg.user.displayName)} text-white text-xs font-semibold`}>
                        {getInitials(msg.user.displayName)}
                      </div>
                    )}
                  </div>
                )}

                {/* Message */}
                <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                  {!isOwnMessage && (
                    <p className="text-spotify-lightGray text-xs mb-1">
                      {msg.user.displayName}
                    </p>
                  )}
                  <div
                    className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-spotify-green text-white'
                        : 'bg-spotify-black text-white'
                    }`}
                  >
                    <p className="break-words">{msg.message}</p>
                  </div>
                  <p className="text-spotify-lightGray text-xs mt-1">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-spotify-lightGray text-sm italic">
          {getTypingText()}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-spotify-black">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-spotify-black text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-spotify-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>

      {/* Members list */}
      <div className="p-4 border-t border-spotify-black">
        <p className="text-spotify-lightGray text-sm mb-2">Online Members</p>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-2 bg-spotify-black px-3 py-1 rounded-full"
            >
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.displayName}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getAvatarColor(member.displayName)} text-white text-xs font-semibold`}>
                  {getInitials(member.displayName)}
                </div>
              )}
              <span className="text-white text-sm">{member.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;