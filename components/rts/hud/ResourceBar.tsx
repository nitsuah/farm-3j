import React from 'react';

import type { DifficultyConfig } from '../RTSGameRoot';

import { BUILDING_COSTS } from '../game/constants';
import { clearSave } from '../game/persistence';
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
  resources: Resources;
  saveStatus: 'idle' | 'saved';
  setGameSpeed: React.Dispatch<React.SetStateAction<number>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  soundMuted: boolean;
  startTimeRef: React.MutableRefObject<number>;
  toggleMute: () => void;
  upkeepMult: number;
  wave: number;
  waveTimerRemainingRef: React.MutableRefObject<number | null>;
  zoom: number;
}

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
  soundMuted,
  startTimeRef,
  toggleMute,
  upkeepMult,
  wave,
  waveTimerRemainingRef,
  zoom,
}) => {
  return (
    <>
      {/* Resource bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 48,
          background:
            dayPhase === 'night' ? 'rgba(10,8,30,0.97)' : 'rgba(15,23,42,0.97)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          fontSize: 17,
          zIndex: 20,
          borderBottom: `3px solid ${dayPhase === 'night' ? '#6366f1' : '#d97706'}`,
          fontWeight: 700,
          gap: 24,
        }}
      >
        <span
          style={{
            color: dayPhase === 'night' ? '#a5b4fc' : '#fde68a',
            background:
              dayPhase === 'night' ? 'rgba(30,20,80,0.7)' : 'transparent',
            padding: '1px 8px',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          {dayPhase === 'night' ? '🌙' : '☀️'}
          <span
            style={{
              display: 'inline-block',
              width: 36,
              height: 4,
              background: '#1e293b',
              borderRadius: 2,
              verticalAlign: 'middle',
              marginLeft: 4,
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
        <span
          style={{
            color: resources.gold < 30 ? '#ef4444' : '#fde68a',
            fontWeight: resources.gold < 30 ? 700 : 400,
            animation: resources.gold < 30 ? 'pulse 1s infinite' : 'none',
          }}
        >
          🪙 {resources.gold}
          {incomeRate.gold > 0 && (
            <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 2 }}>
              +{incomeRate.gold}/m
            </span>
          )}
          {upkeepMult < 1 && (
            <span
              style={{
                fontSize: 10,
                color: upkeepMult < 0.5 ? '#ef4444' : '#fbbf24',
                marginLeft: 3,
              }}
              title={`Upkeep: gold income at ${Math.round(upkeepMult * 100)}%`}
            >
              📉{Math.round(upkeepMult * 100)}%
            </span>
          )}
        </span>
        <span
          style={{
            color: resources.lumber < 20 ? '#ef4444' : '#bbf7d0',
            fontWeight: resources.lumber < 20 ? 700 : 400,
            animation: resources.lumber < 20 ? 'pulse 1s infinite' : 'none',
          }}
        >
          🌲 {resources.lumber}
          {incomeRate.lumber > 0 && (
            <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 2 }}>
              +{incomeRate.lumber}/m
            </span>
          )}
        </span>
        <span
          style={{
            color: resources.stone < 10 ? '#ef4444' : '#cbd5e1',
            fontWeight: resources.stone < 10 ? 700 : 400,
            animation: resources.stone < 10 ? 'pulse 1s infinite' : 'none',
          }}
        >
          🪨 {resources.stone}
          {incomeRate.stone > 0 && (
            <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 2 }}>
              +{incomeRate.stone}/m
            </span>
          )}
        </span>
        {difficulty && (
          <span
            style={{
              fontSize: 12,
              padding: '1px 7px',
              borderRadius: 5,
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
              padding: '1px 10px',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            Wave {wave}
          </span>
        )}
        {!gameOver &&
          (nextWaveAt || waveTimerRemainingRef.current !== null) &&
          (() => {
            const secsLeft =
              gameSpeed === 0
                ? Math.max(
                    0,
                    Math.ceil((waveTimerRemainingRef.current ?? 0) / 1000)
                  )
                : Math.max(0, Math.ceil((nextWaveAt! - Date.now()) / 1000));
            const urgent = secsLeft <= 5 && gameSpeed > 0;
            return (
              <span
                style={{
                  color:
                    gameSpeed === 0
                      ? '#64748b'
                      : urgent
                        ? '#ef4444'
                        : '#94a3b8',
                  fontSize: 13,
                  fontWeight: urgent ? 700 : 400,
                  animation: urgent ? 'pulse 0.6s infinite' : 'none',
                }}
              >
                ⏱ {secsLeft}s{gameSpeed === 0 ? ' ⏸' : ''}
              </span>
            );
          })()}
        {killCount > 0 && (
          <span style={{ color: '#4ade80', fontSize: 14 }}>☠ {killCount}</span>
        )}
        {!gameOver &&
          (() => {
            const elapsedMs = Date.now() - startTimeRef.current;
            const m = Math.floor(elapsedMs / 60000);
            const s = Math.floor((elapsedMs % 60000) / 1000);
            return (
              <span
                style={{ color: '#475569', fontSize: 11 }}
                title="Game time"
              >
                🕐 {m}:{String(s).padStart(2, '0')}
              </span>
            );
          })()}
        <span
          style={{
            color: resources.food >= resources.foodCap ? '#ef4444' : '#fca5a5',
            fontWeight: resources.food >= resources.foodCap ? 700 : 400,
            marginLeft: 'auto',
            animation:
              resources.food >= resources.foodCap
                ? 'pulse 1s infinite'
                : 'none',
          }}
        >
          👥 {resources.food}/{resources.foodCap}
          {resources.food >= resources.foodCap ? ' ⚠' : ''}
        </span>
        {(enemyGrunts.length > 0 ||
          enemyShamans.length > 0 ||
          enemyTrolls.length > 0 ||
          enemySiege.length > 0 ||
          enemyWarchiefs.length > 0 ||
          enemySappers.length > 0) && (
          <span
            style={{
              color: '#f97316',
              fontSize: 12,
              display: 'flex',
              gap: 3,
              alignItems: 'center',
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
              <span title="Troll Archers" style={{ color: '#86efac' }}>
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
        <button
          type="button"
          onClick={() => setGameSpeed(s => (s === 0 ? 1 : s === 1 ? 2 : 0))}
          style={{
            background:
              gameSpeed === 0
                ? 'rgba(239,68,68,0.3)'
                : gameSpeed === 2
                  ? 'rgba(251,191,36,0.3)'
                  : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fde68a',
            padding: '2px 12px',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 700,
          }}
          title="Cycle: Pause / 1× / 2×"
        >
          {gameSpeed === 0 ? '▶ Start' : gameSpeed === 1 ? '⏸ Pause' : '▶▶ 2×'}
        </button>
        <span
          style={{
            color: '#94a3b8',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
          title="Scroll wheel or +/- to zoom"
        >
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              borderRadius: 4,
              width: 18,
              height: 18,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: '16px',
              padding: 0,
              textAlign: 'center',
            }}
          >
            −
          </button>
          <span style={{ minWidth: 32, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              borderRadius: 4,
              width: 18,
              height: 18,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: '16px',
              padding: 0,
              textAlign: 'center',
            }}
          >
            +
          </button>
        </span>
        {buildMode ? (
          <span
            style={{
              color: '#fcd34d',
              background: 'rgba(217,119,6,0.3)',
              padding: '2px 12px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            Placing {BUILDING_COSTS[buildMode].label} · Click to place · Esc to
            cancel
          </span>
        ) : patrolMode ? (
          <span
            style={{
              color: '#22d3ee',
              background: 'rgba(6,182,212,0.2)',
              padding: '2px 12px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            🔄 Patrol Mode · Right-click destination · Esc to cancel
          </span>
        ) : attackMoveMode ? (
          <span
            style={{
              color: '#f87171',
              background: 'rgba(239,68,68,0.2)',
              padding: '2px 12px',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            ⚔️ Attack-Move · Right-click destination · Esc to cancel
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 400 }}>
            WASD pan · scroll zoom · Ctrl+click add to sel · Ctrl+A all · Tab
            idle · Ctrl+1-9 groups · P patrol · A atk-move · H hold · C charge ·
            S sprint · F farmer · Q sword · R cavalry · Del stop · G garrison ·
            E quake (hero lv3) · click building to select
          </span>
        )}
        <button
          type="button"
          onClick={toggleMute}
          title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: soundMuted ? '#ef4444' : '#94a3b8',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {soundMuted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          onClick={doSave}
          style={{
            background:
              saveStatus === 'saved'
                ? 'rgba(74,222,128,0.2)'
                : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: saveStatus === 'saved' ? '#4ade80' : '#94a3b8',
            padding: '2px 10px',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            clearSave();
            if (onNewGame) onNewGame();
            else window.location.reload();
          }}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            padding: '2px 10px',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          🗑 New Game
        </button>
      </div>
    </>
  );
};
