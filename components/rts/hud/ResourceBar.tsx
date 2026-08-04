import React from 'react';

import type { DifficultyConfig } from '../RTSGameRoot';
import { WaveTimer } from '../ui/WaveTimer';

import {
  BUILDING_COSTS,
  LOW_GOLD_WARNING,
  LOW_LUMBER_WARNING,
  LOW_STONE_WARNING,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '../game/constants';
import { clearSave, type SaveSlot } from '../game/persistence';
import type {
  BuildingType,
  EnemyGrunt,
  EnemySapper,
  EnemyShaman,
  EnemySiege,
  EnemyTroll,
  EnemyWarchief,
  Resources,
} from '../game/types';

interface ResourceBarProps {
  attackMoveMode: boolean;
  buildMode: BuildingType | null;
  difficulty?: DifficultyConfig;
  dayPhase: 'day' | 'night';
  dayProgress: number;
  doSave: () => void;
  enemyGrunts: EnemyGrunt[];
  enemySappers: EnemySapper[];
  enemyShamans: EnemyShaman[];
  enemySiege: EnemySiege[];
  enemyTrolls: EnemyTroll[];
  enemyWarchiefs: EnemyWarchief[];
  gameOver: 'victory' | 'defeat' | null;
  gameSpeed: number;
  incomeRate: { gold: number; lumber: number; stone: number };
  killCount: number;
  nextWaveAt: number | null;
  onNewGame?: () => void;
  patrolMode: boolean;
  slot: SaveSlot;
  resources: Resources;
  saveStatus: 'idle' | 'saved';
  setGameSpeed: React.Dispatch<React.SetStateAction<number>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  soundMuted: boolean;
  startTimeRef: React.RefObject<number>;
  toggleMute: () => void;
  upkeepMult: number;
  wave: number;
  waveTimerRemainingRef: React.RefObject<number | null>;
  zoom: number;
}

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  width: '100%',
};

const btnBase: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 700,
  padding: '2px 8px',
  fontSize: 12,
  whiteSpace: 'nowrap',
};

export const ResourceBar: React.FC<ResourceBarProps> = ({
  attackMoveMode,
  buildMode,
  difficulty,
  dayPhase,
  dayProgress,
  doSave,
  enemyGrunts,
  enemySappers,
  enemyShamans,
  enemySiege,
  enemyTrolls,
  enemyWarchiefs,
  gameOver,
  gameSpeed,
  incomeRate,
  killCount,
  nextWaveAt,
  onNewGame,
  patrolMode,
  resources,
  saveStatus,
  setGameSpeed,
  setZoom,
  slot,
  soundMuted,
  startTimeRef,
  toggleMute,
  upkeepMult,
  wave,
  waveTimerRemainingRef,
  zoom,
}) => {
  const hasEnemies =
    enemyGrunts.length > 0 ||
    enemyShamans.length > 0 ||
    enemyTrolls.length > 0 ||
    enemySiege.length > 0 ||
    enemyWarchiefs.length > 0 ||
    enemySappers.length > 0;

  const waveTimerEl = (
    <WaveTimer
      gameOver={gameOver}
      nextWaveAt={nextWaveAt}
      waveTimerRemainingRef={waveTimerRemainingRef}
      gameSpeed={gameSpeed}
    />
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        background:
          dayPhase === 'night' ? 'rgba(10,8,30,0.97)' : 'rgba(15,23,42,0.97)',
        color: '#fff',
        zIndex: 20,
        borderBottom: `2px solid ${dayPhase === 'night' ? '#6366f1' : '#d97706'}`,
        fontWeight: 700,
        padding: '4px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* ── Row 1: core resources + controls ── */}
      <div style={ROW}>
        {/* Day/night */}
        <span
          style={{
            color: dayPhase === 'night' ? '#a5b4fc' : '#fde68a',
            background:
              dayPhase === 'night' ? 'rgba(30,20,80,0.7)' : 'transparent',
            padding: '0 6px',
            borderRadius: 5,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {dayPhase === 'night' ? '🌙' : '☀️'}
          <span
            style={{
              display: 'inline-block',
              width: 28,
              height: 3,
              background: '#1e293b',
              borderRadius: 2,
              verticalAlign: 'middle',
            }}
          >
            <span
              style={{
                display: 'block',
                width: `${(1 - dayProgress) * 100}%`,
                height: '100%',
                background: dayPhase === 'night' ? '#6366f1' : '#fbbf24',
                borderRadius: 2,
              }}
            />
          </span>
        </span>

        {/* Gold */}
        <span
          style={{
            color: resources.gold < LOW_GOLD_WARNING ? '#ef4444' : '#fde68a',
            fontWeight: resources.gold < LOW_GOLD_WARNING ? 700 : 400,
            fontSize: 13,
            animation:
              resources.gold < LOW_GOLD_WARNING ? 'pulse 1s infinite' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          🪙{resources.gold}
          {incomeRate.gold > 0 && (
            <span style={{ fontSize: 10, color: '#a3e635', marginLeft: 1 }}>
              +{incomeRate.gold}
            </span>
          )}
          {upkeepMult < 1 && (
            <span
              style={{
                fontSize: 9,
                color: upkeepMult < 0.5 ? '#ef4444' : '#fbbf24',
                marginLeft: 2,
              }}
              title={`Upkeep: ${Math.round(upkeepMult * 100)}%`}
            >
              📉{Math.round(upkeepMult * 100)}%
            </span>
          )}
        </span>

        {/* Lumber */}
        <span
          style={{
            color:
              resources.lumber < LOW_LUMBER_WARNING ? '#ef4444' : '#bbf7d0',
            fontWeight: resources.lumber < LOW_LUMBER_WARNING ? 700 : 400,
            fontSize: 13,
            animation:
              resources.lumber < LOW_LUMBER_WARNING
                ? 'pulse 1s infinite'
                : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          🌲{resources.lumber}
          {incomeRate.lumber > 0 && (
            <span style={{ fontSize: 10, color: '#a3e635', marginLeft: 1 }}>
              +{incomeRate.lumber}
            </span>
          )}
        </span>

        {/* Stone */}
        <span
          style={{
            color: resources.stone < LOW_STONE_WARNING ? '#ef4444' : '#cbd5e1',
            fontWeight: resources.stone < LOW_STONE_WARNING ? 700 : 400,
            fontSize: 13,
            animation:
              resources.stone < LOW_STONE_WARNING
                ? 'pulse 1s infinite'
                : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          🪨{resources.stone}
          {incomeRate.stone > 0 && (
            <span style={{ fontSize: 10, color: '#a3e635', marginLeft: 1 }}>
              +{incomeRate.stone}
            </span>
          )}
        </span>

        {/* Food */}
        <span
          style={{
            color: resources.food >= resources.foodCap ? '#ef4444' : '#fca5a5',
            fontWeight: resources.food >= resources.foodCap ? 700 : 400,
            fontSize: 13,
            animation:
              resources.food >= resources.foodCap
                ? 'pulse 1s infinite'
                : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          👥{resources.food}/{resources.foodCap}
          {resources.food >= resources.foodCap ? '⚠' : ''}
        </span>

        {/* spacer */}
        <span style={{ flex: 1 }} />

        {/* Enemy threats */}
        {hasEnemies && (
          <span
            style={{
              color: '#f97316',
              fontSize: 11,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠</span>
            {enemyGrunts.filter(g => !g.isSkeleton).length > 0 && (
              <span title="Grunts">
                👹×{enemyGrunts.filter(g => !g.isSkeleton).length}
              </span>
            )}
            {enemyGrunts.filter(g => g.isSkeleton).length > 0 && (
              <span title="Skeletons" style={{ color: '#a78bfa' }}>
                💀×{enemyGrunts.filter(g => g.isSkeleton).length}
              </span>
            )}
            {enemyShamans.length > 0 && (
              <span title="Shamans" style={{ color: '#c084fc' }}>
                🧙×{enemyShamans.length}
              </span>
            )}
            {enemyTrolls.length > 0 && (
              <span title="Trolls" style={{ color: '#86efac' }}>
                🏹×{enemyTrolls.length}
              </span>
            )}
            {enemySappers.length > 0 && (
              <span title="Sappers" style={{ color: '#fb923c' }}>
                💣×{enemySappers.length}
              </span>
            )}
            {enemySiege.length > 0 && (
              <span title="Siege" style={{ color: '#fcd34d' }}>
                💥×{enemySiege.length}
              </span>
            )}
            {enemyWarchiefs.length > 0 && (
              <span
                title="Warchiefs"
                style={{ color: '#fbbf24', fontWeight: 700 }}
              >
                👑×{enemyWarchiefs.length}
              </span>
            )}
          </span>
        )}

        {/* Speed */}
        <button
          type="button"
          onClick={() =>
            setGameSpeed(s => (s === 0 ? 1 : s === 1 ? 2 : s === 2 ? 3 : 0))
          }
          style={{
            ...btnBase,
            background:
              gameSpeed === 0
                ? 'rgba(239,68,68,0.3)'
                : gameSpeed === 3
                  ? 'rgba(167,139,250,0.35)'
                  : gameSpeed === 2
                    ? 'rgba(251,191,36,0.3)'
                    : 'rgba(255,255,255,0.08)',
            color: '#fde68a',
          }}
          title="Cycle: Pause / 1× / 2× / 3×"
        >
          {gameSpeed === 0
            ? '▶'
            : gameSpeed === 1
              ? '⏸'
              : gameSpeed === 2
                ? '▶▶'
                : '▶▶▶'}
        </button>

        {/* Zoom */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            style={{
              ...btnBase,
              padding: '0 5px',
              background: 'none',
              color: '#94a3b8',
              width: 18,
              height: 18,
            }}
          >
            −
          </button>
          <span
            style={{
              fontSize: 10,
              color: '#64748b',
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            style={{
              ...btnBase,
              padding: '0 5px',
              background: 'none',
              color: '#94a3b8',
              width: 18,
              height: 18,
            }}
          >
            +
          </button>
        </span>

        {/* Mute */}
        <button
          type="button"
          onClick={toggleMute}
          title={soundMuted ? 'Unmute' : 'Mute'}
          style={{
            ...btnBase,
            background: 'rgba(255,255,255,0.08)',
            color: soundMuted ? '#ef4444' : '#94a3b8',
          }}
        >
          {soundMuted ? '🔇' : '🔊'}
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={doSave}
          style={{
            ...btnBase,
            background:
              saveStatus === 'saved'
                ? 'rgba(74,222,128,0.2)'
                : 'rgba(255,255,255,0.08)',
            color: saveStatus === 'saved' ? '#4ade80' : '#94a3b8',
          }}
        >
          {saveStatus === 'saved' ? '✓' : '💾'}
        </button>

        {/* New game */}
        <button
          type="button"
          onClick={() => {
            clearSave(slot);
            if (onNewGame) onNewGame();
            else window.location.reload();
          }}
          style={{
            ...btnBase,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
          }}
        >
          🗑
        </button>
      </div>

      {/* ── Row 2: status bar ── */}
      <div style={{ ...ROW, gap: 6, fontSize: 11 }}>
        {difficulty && (
          <span
            style={{
              fontSize: 11,
              padding: '0 5px',
              borderRadius: 4,
              background:
                difficulty.id === 'easy'
                  ? 'rgba(74,222,128,0.12)'
                  : difficulty.id === 'hard'
                    ? 'rgba(248,113,113,0.12)'
                    : 'rgba(96,165,250,0.12)',
              color:
                difficulty.id === 'easy'
                  ? '#4ade80'
                  : difficulty.id === 'hard'
                    ? '#f87171'
                    : '#60a5fa',
            }}
          >
            {difficulty.icon} {difficulty.label}
          </span>
        )}
        {wave > 0 && (
          <span
            style={{
              color: '#f97316',
              background: 'rgba(249,115,22,0.15)',
              padding: '0 6px',
              borderRadius: 4,
            }}
          >
            Wave {wave}
          </span>
        )}
        {waveTimerEl}
        {killCount > 0 && (
          <span style={{ color: '#4ade80' }}>☠{killCount}</span>
        )}
        {!gameOver &&
          (() => {
            const elapsedMs = Date.now() - startTimeRef.current;
            const m = Math.floor(elapsedMs / 60000);
            const s = Math.floor((elapsedMs % 60000) / 1000);
            return (
              <span style={{ color: '#475569' }}>
                🕐{m}:{String(s).padStart(2, '0')}
              </span>
            );
          })()}

        {/* Build/patrol/attack mode hint */}
        {buildMode ? (
          <span
            style={{
              color: '#fcd34d',
              background: 'rgba(217,119,6,0.3)',
              padding: '0 8px',
              borderRadius: 4,
            }}
          >
            Placing {BUILDING_COSTS[buildMode].label} · Click · Esc cancel
          </span>
        ) : patrolMode ? (
          <span
            style={{
              color: '#22d3ee',
              background: 'rgba(6,182,212,0.2)',
              padding: '0 8px',
              borderRadius: 4,
            }}
          >
            🔄 Patrol · RClick dest · Esc
          </span>
        ) : attackMoveMode ? (
          <span
            style={{
              color: '#f87171',
              background: 'rgba(239,68,68,0.2)',
              padding: '0 8px',
              borderRadius: 4,
            }}
          >
            ⚔️ Atk-Move · RClick dest · Esc
          </span>
        ) : (
          <span style={{ color: '#475569', fontSize: 10, fontWeight: 400 }}>
            WASD pan · scroll zoom · Ctrl+click sel · P patrol · A atk-move · H
            hold · C charge · S sprint · F farmer · Q sword · R cav · G garrison
            · E quake
          </span>
        )}
      </div>
    </div>
  );
};
