import React, { useState, useCallback } from 'react';
import RTSMap from './RTSMap';

export const RTSGameRoot: React.FC = () => {
  const [gameKey, setGameKey] = useState(0);
  const handleNewGame = useCallback(() => setGameKey(k => k + 1), []);
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <RTSMap key={gameKey} onNewGame={handleNewGame} />
    </div>
  );
};
