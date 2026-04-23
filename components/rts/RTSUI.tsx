import React from 'react';

interface RTSUIProps {
  selectedType: 'worker' | 'farmhouse' | null;
  selectedWorker: any;
  farmhouse: { built: boolean; level: number };
  farmhouseUpgradeCosts: { gold: number; lumber: number }[];
  farmhouseStorage: { gold: number; lumber: number }[];
  resources: { gold: number; lumber: number };
  onFarmhouseAction: (action: string) => void;
}

export const RTSUI: React.FC<RTSUIProps> = ({
  selectedType,
  selectedWorker,
  farmhouse,
  farmhouseUpgradeCosts,
  farmhouseStorage,
  resources,
  onFarmhouseAction,
}) => {
  return (
    <div className="absolute bottom-0 left-0 z-30 h-36 w-full border-t-4 border-amber-600 bg-slate-950/95 px-4 py-3">
      <div className="grid h-full grid-cols-1 items-stretch gap-3 md:grid-cols-[220px_1fr_220px]">
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">
            Selection
          </div>
          <div className="mt-2 text-sm font-semibold">Farmer</div>
          <div className="mt-1 text-xs text-slate-300">Ready for orders</div>
        </div>

        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3">
          <div className="mb-2 text-xs tracking-wide text-amber-300/90 uppercase">
            Command Card
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-sm text-amber-100">
              Move
            </button>
            <button className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-sm text-amber-100">
              Gather
            </button>
            <button className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-sm text-amber-100">
              Build
            </button>
            <button className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-sm text-amber-100">
              Stop
            </button>
          </div>
        </div>

        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">
            Minimap
          </div>
          <div className="mt-2 h-16 rounded border border-slate-700 bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
};
