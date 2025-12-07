'use client';

interface IsometricTownProps {
  buildings?: number;
}

export function IsometricTownScene({ buildings = 3 }: IsometricTownProps) {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-100 dark:from-blue-950 dark:to-blue-900" />

      {/* Isometric buildings */}
      <div className="absolute inset-0 flex items-end justify-center gap-8 pb-8">
        {/* Building 1 - House */}
        <div className="relative">
          <div className="-translate-y-2 transform text-5xl">🏠</div>
          <div className="absolute -bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-green-600 opacity-50 blur-sm dark:bg-green-800" />
        </div>

        {/* Building 2 - Barn */}
        <div className="relative">
          <div className="-translate-y-4 transform text-6xl">🏚️</div>
          <div className="absolute -bottom-2 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-green-600 opacity-50 blur-sm dark:bg-green-800" />
        </div>

        {/* Building 3 - Silo */}
        {buildings >= 3 && (
          <div className="relative">
            <div className="-translate-y-1 transform text-4xl">🗼</div>
            <div className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-green-600 opacity-50 blur-sm dark:bg-green-800" />
          </div>
        )}
      </div>

      {/* Trees */}
      <div className="absolute bottom-4 left-4 text-3xl">🌳</div>
      <div className="absolute right-8 bottom-8 text-2xl">🌲</div>
    </div>
  );
}
