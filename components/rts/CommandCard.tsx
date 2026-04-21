import React from 'react';

const CommandCard: React.FC = () => {
  return (
    <div className="bg-opacity-95 absolute bottom-0 left-0 z-30 flex h-32 w-full items-center justify-center border-t-4 border-yellow-400 bg-slate-800">
      {/* Placeholder for command buttons */}
      <div className="flex gap-4">
        <button className="rounded bg-yellow-400 px-6 py-3 font-bold text-slate-900 shadow">
          Move
        </button>
        <button className="rounded bg-yellow-400 px-6 py-3 font-bold text-slate-900 shadow">
          Attack
        </button>
        <button className="rounded bg-yellow-400 px-6 py-3 font-bold text-slate-900 shadow">
          Stop
        </button>
        <button className="rounded bg-yellow-400 px-6 py-3 font-bold text-slate-900 shadow">
          Build
        </button>
      </div>
    </div>
  );
};

export default CommandCard;
