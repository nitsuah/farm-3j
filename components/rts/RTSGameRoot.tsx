import React from 'react';
import RTSMap from './RTSMap';
import { RTSUI } from './RTSUI';

export const RTSGameRoot: React.FC = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <RTSMap />
      <RTSUI />
    </div>
  );
};
