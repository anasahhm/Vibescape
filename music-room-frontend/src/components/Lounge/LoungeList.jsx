import LoungeCard from './LoungeCard';

const LoungeList = ({ lounges, onLoungeClick }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lounges.map(lounge => (
        <LoungeCard
          key={lounge._id}
          lounge={lounge}
          onClick={() => onLoungeClick(lounge._id)}
        />
      ))}
    </div>
  );
};

export default LoungeList;