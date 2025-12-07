'use client';

import { Crop } from './Crop';
import { FlyingBug } from './FlyingBug';

export function GrowingCropScene() {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-100 dark:from-sky-900 dark:to-green-950" />

      {/* Ground */}
      <div className="absolute bottom-0 h-16 w-full bg-amber-800 dark:bg-amber-950" />

      {/* Crops */}
      <div className="absolute right-0 bottom-12 left-0 flex justify-around px-4">
        <Crop type="corn" growthStage={0} animate={true} />
        <Crop type="wheat" growthStage={1} animate={true} />
        <Crop type="carrot" growthStage={2} animate={true} />
        <Crop type="corn" growthStage={0} animate={true} />
        <Crop type="wheat" growthStage={1} animate={true} />
      </div>

      {/* Flying bugs */}
      <FlyingBug type="bee" />
      <FlyingBug type="butterfly" />
    </div>
  );
}
