'use client';

import React, { useEffect, useState } from 'react';

const DISMISSED_KEY = 'farm3j_desktop_notice_dismissed';

/** Touch devices only: the game needs a mouse and keyboard. */
export const DesktopNotice: React.FC<{ onDemo?: () => void }> = ({
  onDemo,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      // blocked storage: show the notice
    }
    setShow(!dismissed);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // still dismiss for this view
    }
    setShow(false);
  };

  return (
    <div
      role="note"
      className="mx-auto max-w-md rounded-xl border-2 border-yellow-500 bg-slate-900 p-4 text-center text-sm text-yellow-100"
    >
      <p className="mb-3 font-semibold">
        Best on desktop: this game uses a mouse and keyboard.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {onDemo ? (
          <button
            type="button"
            onClick={onDemo}
            className="rounded-lg bg-yellow-500 px-3 py-2 font-bold text-black"
          >
            Watch the demo
          </button>
        ) : (
          <a
            href="/rtsfarm/play?demo=1"
            className="rounded-lg bg-yellow-500 px-3 py-2 font-bold text-black"
          >
            Watch the demo
          </a>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-yellow-500 px-3 py-2"
        >
          Continue anyway
        </button>
      </div>
    </div>
  );
};
