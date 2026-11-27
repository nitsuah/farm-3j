'use client';

import React, { useEffect, useRef, useState } from 'react';

const SEEN_KEY = 'farm3j_quickstart_seen';

const STEPS = [
  'Goal: protect your barn and destroy the enemy barn.',
  'Select a farmer, then right-click a resource to harvest it.',
  'Build a Farmhouse, then a Barracks.',
  'Train Swordsmen before the first wave or nightfall.',
  'Controls: click to select, right-click to move or attack, WASD to pan, scroll to zoom, Space to pause.',
];

interface QuickStartPanelProps {
  /** Called whenever the panel opens, so the game stays paused behind it. */
  onOpen: () => void;
}

export const QuickStartPanel: React.FC<QuickStartPanelProps> = ({ onOpen }) => {
  const [open, setOpen] = useState(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY) !== '1') setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    onOpenRef.current();
    // Game hotkeys (including Space) must not act while the panel is up.
    const block = (event: KeyboardEvent) => {
      event.stopImmediatePropagation();
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', block, true);
    return () => window.removeEventListener('keydown', block, true);
  }, [open]);

  function close() {
    localStorage.setItem(SEEN_KEY, '1');
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick start help"
        title="Quick start"
        className="fixed top-14 right-14 z-[150] h-9 w-9 rounded-lg border border-violet-600 bg-indigo-950 text-lg font-bold text-violet-200"
      >
        ?
      </button>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quickstart-title"
            className="w-full max-w-md rounded-xl border-2 border-yellow-500 bg-slate-900 p-5 text-slate-100"
          >
            <h2 id="quickstart-title" className="mb-3 text-xl font-bold text-yellow-200">
              Quick Start
            </h2>
            <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm">
              {STEPS.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button
              type="button"
              autoFocus
              onClick={close}
              className="w-full rounded-lg bg-yellow-500 py-2 font-bold text-black"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
