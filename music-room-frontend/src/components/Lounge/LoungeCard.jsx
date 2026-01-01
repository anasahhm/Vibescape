import { getInitials, getAvatarColor } from '../../utils/helpers';

const LoungeCard = ({ lounge, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-spotify-gray p-6 rounded-xl hover:bg-opacity-80 transition-all cursor-pointer card-hover animate-slideIn group relative overflow-hidden"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-spotify-green to-green-400 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 animate-shimmer"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl animate-float">🎵</span>
          <h3 className="text-xl font-semibold text-white group-hover:text-spotify-green transition-colors">
            {lounge.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-spotify-lightGray text-sm">
            Code: <span className="font-mono font-bold text-spotify-green bg-spotify-black px-2 py-1 rounded">
              {lounge.code}
            </span>
          </span>
          <span className="text-spotify-lightGray text-sm flex items-center gap-1">
            <span className="text-lg">👥</span>
            {lounge.members.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-spotify-lightGray text-sm">Created by:</span>
          <div className="flex items-center gap-2">
            {lounge.creator.profileImage ? (
              <img
                src={lounge.creator.profileImage}
                alt={lounge.creator.displayName}
                className="w-6 h-6 rounded-full ring-2 ring-spotify-green ring-opacity-0 group-hover:ring-opacity-50 transition-all"
              />
            ) : (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getAvatarColor(lounge.creator.displayName)} text-white text-xs font-semibold`}>
                {getInitials(lounge.creator.displayName)}
              </div>
            )}
            <span className="text-white text-sm">{lounge.creator.displayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoungeCard;