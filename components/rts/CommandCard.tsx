import React from 'react';

const CommandCard: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-32 bg-slate-800 bg-opacity-95 border-t-4 border-yellow-400 flex items-center justify-center z-30">
      {/* Placeholder for command buttons */}
      <div className="flex gap-4">
        <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded shadow">Move</button>
        <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded shadow">Attack</button>
        <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded shadow">Stop</button>
        <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded shadow">Build</button>
      </div>
    </div>
  );
};

export default CommandCard;
