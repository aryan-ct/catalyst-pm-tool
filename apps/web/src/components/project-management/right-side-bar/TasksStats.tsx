type TaskCard = {
  label: string;
  value: number;
};

const TasksStats = () => {
  const statisticCards: TaskCard[] = [
    { label: 'total', value: 23 },
    { label: 'in progress', value: 23 },
    { label: 'waiting', value: 23 },
    { label: 'completed', value: 23 },
  ];
  return (
    <div className="flex flex-col gap-2">
      <span className="font-bold text-xl">Tasks</span>
      <div className="grid grid-cols-2 gap-3 mt-3">
        {statisticCards.map((statCard, index) => (
          <SingleCard key={index} statCard={statCard} />
        ))}
      </div>
    </div>
  );
};

function SingleCard({ statCard }: { statCard: TaskCard }) {
  return (
    <div className="p-3 bg-gray-100 rounded-xl">
      <span className="text-gray-600 text-[12px]">
        {statCard.label.toUpperCase()}
      </span>
      <div className="flex gap-2 mt-1 items-center">
        <span className="font-bold text-lg">{statCard.value}</span>
      </div>
    </div>
  );
}

export default TasksStats;
