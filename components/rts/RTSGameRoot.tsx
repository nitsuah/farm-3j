import React from 'react';
import { RTSMap } from './RTSMap';
import { RTSUI } from './RTSUI';

export const RTSGameRoot: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <RTSMap />
      <RTSUI />
    </div>
  );
};
