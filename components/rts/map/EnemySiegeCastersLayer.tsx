import React from 'react';

import {
  DEMOLISHER_FIRE_RANGE,
  NECROMANCER_RAISE_RADIUS,
  TILE_SIZE,
  WITCH_DOCTOR_BUFF_RADIUS,
} from '../game/constants';
import { tileDist, tileToSvg } from '../game/map';
import type {
  EnemyNecromancer,
  EnemySapper,
  EnemyShaman,
  EnemySiege,
  EnemyWitchDoctor,
} from '../game/types';

interface EnemySiegeCastersLayerProps {
  anySelected: boolean;
  enemyNecromancers: EnemyNecromancer[];
  enemySappers: EnemySapper[];
  enemyShamans: EnemyShaman[];
  enemySiege: EnemySiege[];
  enemyWitchDoctors: EnemyWitchDoctor[];
  fogVisible: boolean[][];
  handleAttackNecromancer: (necroId: number, e: React.MouseEvent) => void;
  handleAttackSapper: (sapperId: number, e: React.MouseEvent) => void;
  handleAttackShaman: (shamanId: number, e: React.MouseEvent) => void;
  handleAttackSiege: (siegeId: number, e: React.MouseEvent) => void;
  handleAttackWitchDoctor: (wdId: number, e: React.MouseEvent) => void;
}

export function EnemySiegeCastersLayer({
  anySelected,
  enemyNecromancers,
  enemySappers,
  enemyShamans,
  enemySiege,
  enemyWitchDoctors,
  fogVisible,
  handleAttackNecromancer,
  handleAttackSapper,
  handleAttackShaman,
  handleAttackSiege,
  handleAttackWitchDoctor,
}: EnemySiegeCastersLayerProps) {
  return (
    <>
          {/* War Rams & Demolishers (enemy siege units) */}
          {enemySiege
            .filter(
              r => r.hp > 0 && fogVisible[Math.round(r.x)]?.[Math.round(r.y)]
            )
            .map(r => {
              const { isoX, isoY } = tileToSvg(r.x, r.y);
              const hp = r.hp / r.maxHp;
              const cx = isoX + TILE_SIZE / 2;
              const cy = isoY + 18;
              if (r.siegeType === 'demolisher') {
                return (
                  <g
                    key={`ram-${r.id}`}
                    style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                    onContextMenu={e => handleAttackSiege(r.id, e)}
                  >
                    {/* Orange fire range ring when attacking */}
                    {r.state === 'attacking' && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={DEMOLISHER_FIRE_RANGE * TILE_SIZE * 0.5}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth={1}
                        strokeDasharray="6 4"
                        opacity={0.4}
                      />
                    )}
                    {/* Catapult body */}
                    <rect
                      x={cx - 20}
                      y={cy - 12}
                      width={40}
                      height={20}
                      fill="#7f1d1d"
                      stroke="#450a0a"
                      strokeWidth={2}
                      rx={3}
                    />
                    {/* Arm */}
                    <line
                      x1={cx - 4}
                      y1={cy - 12}
                      x2={cx + 12}
                      y2={cy - 28}
                      stroke="#451a03"
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                    {/* Boulder */}
                    <circle
                      cx={cx + 12}
                      cy={cy - 30}
                      r={5}
                      fill="#374151"
                      stroke="#6b7280"
                      strokeWidth={1.5}
                    />
                    {/* Wheels */}
                    <circle
                      cx={cx - 14}
                      cy={cy + 10}
                      r={6}
                      fill="#292524"
                      stroke="#78716c"
                      strokeWidth={2}
                    />
                    <circle
                      cx={cx + 14}
                      cy={cy + 10}
                      r={6}
                      fill="#292524"
                      stroke="#78716c"
                      strokeWidth={2}
                    />
                    <text
                      x={cx}
                      y={isoY - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#fb923c"
                      fontWeight="bold"
                    >
                      DEMOLISHER
                    </text>
                    <rect
                      x={cx - 20}
                      y={isoY - 10}
                      width={40}
                      height={4}
                      fill="#1e293b"
                      rx={2}
                    />
                    <rect
                      x={cx - 20}
                      y={isoY - 10}
                      width={40 * hp}
                      height={4}
                      fill="#f97316"
                      rx={2}
                    />
                  </g>
                );
              }
              return (
                <g
                  key={`ram-${r.id}`}
                  style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                  onContextMenu={e => handleAttackSiege(r.id, e)}
                >
                  {/* Ram body — thick wooden log frame */}
                  <rect
                    x={cx - 26}
                    y={isoY + 4}
                    width={52}
                    height={22}
                    fill={r.state === 'attacking' ? '#7c2d12' : '#92400e'}
                    stroke="#451a03"
                    strokeWidth={3}
                    rx={4}
                  />
                  {/* Battering ram log */}
                  <rect
                    x={cx - 20}
                    y={isoY + 10}
                    width={40}
                    height={10}
                    fill="#1c1917"
                    stroke="#44403c"
                    strokeWidth={2}
                    rx={5}
                  />
                  {/* Ram head metal tip */}
                  <polygon
                    points={`${cx + 20},${isoY + 12} ${cx + 30},${isoY + 15} ${cx + 20},${isoY + 18}`}
                    fill="#6b7280"
                    stroke="#374151"
                    strokeWidth={1.5}
                  />
                  {/* Wheels */}
                  <circle
                    cx={cx - 16}
                    cy={isoY + 30}
                    r={6}
                    fill="#292524"
                    stroke="#78716c"
                    strokeWidth={2}
                  />
                  <circle
                    cx={cx + 16}
                    cy={isoY + 30}
                    r={6}
                    fill="#292524"
                    stroke="#78716c"
                    strokeWidth={2}
                  />
                  <text
                    x={cx}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#fca5a5"
                    fontWeight="bold"
                  >
                    WAR RAM
                  </text>
                  <rect
                    x={cx - 20}
                    y={isoY - 10}
                    width={40}
                    height={4}
                    fill="#1e293b"
                    rx={2}
                  />
                  <rect
                    x={cx - 20}
                    y={isoY - 10}
                    width={40 * hp}
                    height={4}
                    fill="#dc2626"
                    rx={2}
                  />
                </g>
              );
            })}

          {/* Enemy Shamans */}
          {enemyShamans
            .filter(
              s => s.hp > 0 && fogVisible[Math.round(s.x)]?.[Math.round(s.y)]
            )
            .map(s => {
              const { isoX, isoY } = tileToSvg(s.x, s.y);
              const hp = s.hp / s.maxHp;
              return (
                <g
                  key={`shaman-${s.id}`}
                  style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                  onContextMenu={e => handleAttackShaman(s.id, e)}
                >
                  {/* Robe */}
                  <ellipse
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 26}
                    rx={10}
                    ry={14}
                    fill={s.state === 'healing' ? '#4ade80' : '#166534'}
                    stroke="#14532d"
                    strokeWidth={2}
                  />
                  {/* Head */}
                  <circle
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 10}
                    r={8}
                    fill="#fde68a"
                    stroke="#78350f"
                    strokeWidth={1.5}
                  />
                  {/* Staff */}
                  <line
                    x1={isoX + TILE_SIZE / 2 + 12}
                    y1={isoY + 6}
                    x2={isoX + TILE_SIZE / 2 + 12}
                    y2={isoY + 38}
                    stroke="#92400e"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 12}
                    cy={isoY + 5}
                    r={4}
                    fill={s.state === 'healing' ? '#4ade80' : '#a855f7'}
                  />
                  {/* Heal pulse ring */}
                  {s.state === 'healing' && (
                    <circle
                      cx={isoX + TILE_SIZE / 2}
                      cy={isoY + 20}
                      r={22}
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth={1.5}
                      opacity={0.5}
                    />
                  )}
                  {/* Label */}
                  <text
                    x={isoX + TILE_SIZE / 2}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#86efac"
                    fontWeight="bold"
                  >
                    SHAMAN
                  </text>
                  {/* HP bar */}
                  <rect
                    x={isoX + TILE_SIZE / 2 - 16}
                    y={isoY - 10}
                    width={32}
                    height={4}
                    fill="#1e293b"
                    rx={2}
                  />
                  <rect
                    x={isoX + TILE_SIZE / 2 - 16}
                    y={isoY - 10}
                    width={32 * hp}
                    height={4}
                    fill="#22c55e"
                    rx={2}
                  />
                </g>
              );
            })}

          {/* Necromancers */}
          {enemyNecromancers
            .filter(
              n => n.hp > 0 && fogVisible[Math.round(n.x)]?.[Math.round(n.y)]
            )
            .map(n => {
              const { isoX, isoY } = tileToSvg(n.x, n.y);
              const hp = n.hp / n.maxHp;
              const cx = isoX + TILE_SIZE / 2;
              return (
                <g
                  key={`necro-${n.id}`}
                  style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                  onContextMenu={e => handleAttackNecromancer(n.id, e)}
                >
                  {/* Dark robe */}
                  <ellipse
                    cx={cx}
                    cy={isoY + 26}
                    rx={10}
                    ry={14}
                    fill={n.state === 'raising' ? '#7c3aed' : '#1e1b4b'}
                    stroke="#0f0a2a"
                    strokeWidth={2}
                  />
                  {/* Skull head */}
                  <circle
                    cx={cx}
                    cy={isoY + 10}
                    r={8}
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth={1.5}
                  />
                  <circle cx={cx - 2} cy={isoY + 9} r={1.5} fill="#1e293b" />
                  <circle cx={cx + 2} cy={isoY + 9} r={1.5} fill="#1e293b" />
                  {/* Staff with orb */}
                  <line
                    x1={cx + 12}
                    y1={isoY + 6}
                    x2={cx + 12}
                    y2={isoY + 38}
                    stroke="#4c1d95"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={cx + 12}
                    cy={isoY + 4}
                    r={5}
                    fill={n.state === 'raising' ? '#a855f7' : '#4c1d95'}
                    stroke="#7c3aed"
                    strokeWidth={1}
                  />
                  {/* Raise pulse when channeling */}
                  {n.state === 'raising' && (
                    <circle
                      cx={cx}
                      cy={isoY + 20}
                      r={NECROMANCER_RAISE_RADIUS * TILE_SIZE * 0.5}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                      opacity={0.5}
                    />
                  )}
                  <text
                    x={cx}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#c4b5fd"
                    fontWeight="bold"
                  >
                    NECROMANCER
                  </text>
                  <rect
                    x={cx - 18}
                    y={isoY - 10}
                    width={36}
                    height={4}
                    fill="#1e293b"
                    rx={2}
                  />
                  <rect
                    x={cx - 18}
                    y={isoY - 10}
                    width={36 * hp}
                    height={4}
                    fill="#a855f7"
                    rx={2}
                  />
                </g>
              );
            })}

          {/* Witch Doctors */}
          {enemyWitchDoctors
            .filter(
              d => d.hp > 0 && fogVisible[Math.round(d.x)]?.[Math.round(d.y)]
            )
            .map(wd => {
              const { isoX, isoY } = tileToSvg(wd.x, wd.y);
              const hp = wd.hp / wd.maxHp;
              const cx = isoX + TILE_SIZE / 2;
              return (
                <g
                  key={`wd-${wd.id}`}
                  style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                  onContextMenu={e => handleAttackWitchDoctor(wd.id, e)}
                >
                  {/* Dark purple robe */}
                  <ellipse
                    cx={cx}
                    cy={isoY + 26}
                    rx={11}
                    ry={14}
                    fill={wd.state === 'casting' ? '#7e22ce' : '#4c1d95'}
                    stroke="#2e1065"
                    strokeWidth={2}
                  />
                  {/* Head with mask */}
                  <circle
                    cx={cx}
                    cy={isoY + 10}
                    r={7}
                    fill="#fde68a"
                    stroke="#78350f"
                    strokeWidth={1}
                  />
                  {/* Bone mask markings */}
                  <line
                    x1={cx - 4}
                    y1={isoY + 10}
                    x2={cx + 4}
                    y2={isoY + 10}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  {/* Voodoo staff */}
                  <line
                    x1={cx + 11}
                    y1={isoY + 5}
                    x2={cx + 11}
                    y2={isoY + 38}
                    stroke="#7c3aed"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  {/* Skull on staff */}
                  <circle
                    cx={cx + 11}
                    cy={isoY + 3}
                    r={4}
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth={1}
                  />
                  <circle cx={cx + 9} cy={isoY + 2} r={1} fill="#1e293b" />
                  <circle cx={cx + 13} cy={isoY + 2} r={1} fill="#1e293b" />
                  {/* Casting ring when buffing */}
                  {wd.state === 'casting' && (
                    <circle
                      cx={cx}
                      cy={isoY + 20}
                      r={WITCH_DOCTOR_BUFF_RADIUS * TILE_SIZE * 0.5}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      opacity={0.6}
                    />
                  )}
                  <text
                    x={cx}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#e879f9"
                    fontWeight="bold"
                  >
                    WITCH DOCTOR
                  </text>
                  <rect
                    x={cx - 18}
                    y={isoY - 10}
                    width={36}
                    height={4}
                    fill="#1e293b"
                    rx={2}
                  />
                  <rect
                    x={cx - 18}
                    y={isoY - 10}
                    width={36 * hp}
                    height={4}
                    fill="#e879f9"
                    rx={2}
                  />
                </g>
              );
            })}

          {/* Goblin Sappers */}
          {enemySappers
            .filter(
              s =>
                s.hp > 0 &&
                !s.exploded &&
                fogVisible[Math.round(s.x)]?.[Math.round(s.y)]
            )
            .map(s => {
              const { isoX, isoY } = tileToSvg(s.x, s.y);
              const hp = s.hp / s.maxHp;
              const urgency = tileDist(s.x, s.y, s.targetX, s.targetY) < 3;
              return (
                <g
                  key={`sapper-${s.id}`}
                  style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                  onContextMenu={e => handleAttackSapper(s.id, e)}
                >
                  {/* Body */}
                  <ellipse
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 22}
                    rx={8}
                    ry={10}
                    fill={urgency ? '#dc2626' : '#b91c1c'}
                    stroke="#7f1d1d"
                    strokeWidth={2}
                  />
                  {/* Head */}
                  <circle
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 10}
                    r={8}
                    fill={urgency ? '#fbbf24' : '#f59e0b'}
                    stroke="#78350f"
                    strokeWidth={1.5}
                  />
                  {/* Eyes (beady goblin) */}
                  <circle
                    cx={isoX + TILE_SIZE / 2 - 3}
                    cy={isoY + 9}
                    r={2}
                    fill="#1c1917"
                  />
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 3}
                    cy={isoY + 9}
                    r={2}
                    fill="#1c1917"
                  />
                  {/* TNT barrel */}
                  <rect
                    x={isoX + TILE_SIZE / 2 - 6}
                    y={isoY + 28}
                    width={12}
                    height={10}
                    fill="#292524"
                    stroke="#78716c"
                    strokeWidth={1.5}
                    rx={2}
                  />
                  <line
                    x1={isoX + TILE_SIZE / 2 - 4}
                    y1={isoY + 30}
                    x2={isoX + TILE_SIZE / 2 + 4}
                    y2={isoY + 30}
                    stroke="#78716c"
                    strokeWidth={1}
                  />
                  <line
                    x1={isoX + TILE_SIZE / 2 - 4}
                    y1={isoY + 33}
                    x2={isoX + TILE_SIZE / 2 + 4}
                    y2={isoY + 33}
                    stroke="#78716c"
                    strokeWidth={1}
                  />
                  {/* Fuse spark */}
                  <text
                    x={isoX + TILE_SIZE / 2 + 6}
                    y={isoY + 28}
                    fontSize="10"
                  >
                    ✨
                  </text>
                  {/* Urgency pulse */}
                  {urgency && (
                    <circle
                      cx={isoX + TILE_SIZE / 2}
                      cy={isoY + 20}
                      r={22}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth={2}
                      opacity={0.6}
                    />
                  )}
                  {/* Label */}
                  <text
                    x={isoX + TILE_SIZE / 2}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#fca5a5"
                    fontWeight="bold"
                  >
                    SAPPER
                  </text>
                  {/* HP bar */}
                  <rect
                    x={isoX + TILE_SIZE / 2 - 14}
                    y={isoY - 10}
                    width={28}
                    height={4}
                    fill="#1e293b"
                    rx={2}
                  />
                  <rect
                    x={isoX + TILE_SIZE / 2 - 14}
                    y={isoY - 10}
                    width={28 * hp}
                    height={4}
                    fill="#dc2626"
                    rx={2}
                  />
                </g>
              );
            })}

    </>
  );
}
