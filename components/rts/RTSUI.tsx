import React from 'react';

export const RTSUI: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-32 bg-gray-900 bg-opacity-90 border-t-4 border-yellow-700 flex items-end p-4">
      {/* TODO: Add minimap, resource panel, unit/building controls, etc. */}
      <div className="text-white font-bold">Resources: <span className="text-green-300">0</span> Lumber <span className="text-yellow-300">0</span> Gold</div>
      {/* Add more UI panels as needed */}
    </div>
  );
};
