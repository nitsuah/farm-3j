import React from 'react';

export const RTSUI: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-36 bg-slate-950/95 border-t-4 border-amber-600 px-4 py-3 z-30">
      <div className="grid h-full grid-cols-1 md:grid-cols-[220px_1fr_220px] gap-3 items-stretch">
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs uppercase tracking-wide text-amber-300/90">Selection</div>
          <div className="mt-2 text-sm font-semibold">Farmer</div>
          <div className="mt-1 text-xs text-slate-300">Ready for orders</div>
        </div>

        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3">
          <div className="text-xs uppercase tracking-wide text-amber-300/90 mb-2">Command Card</div>
          <div className="grid grid-cols-4 gap-2">
            <button className="rounded border border-amber-500/70 bg-amber-500/15 text-amber-100 px-2 py-2 text-sm">Move</button>
            <button className="rounded border border-amber-500/70 bg-amber-500/15 text-amber-100 px-2 py-2 text-sm">Gather</button>
            <button className="rounded border border-amber-500/70 bg-amber-500/15 text-amber-100 px-2 py-2 text-sm">Build</button>
            <button className="rounded border border-amber-500/70 bg-amber-500/15 text-amber-100 px-2 py-2 text-sm">Stop</button>
          </div>
        </div>

        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs uppercase tracking-wide text-amber-300/90">Minimap</div>
          <div className="mt-2 h-16 rounded border border-slate-700 bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
};
