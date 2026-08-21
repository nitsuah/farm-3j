'use client';
import { useEffect } from 'react';

import type { HeroItem, PlacedBuilding, WorkerState } from '../game/types';

const KILLS = { first_blood: 1, kill_100: 100, kill_500: 500 } as const;
const WAVES = { wave_10: 10, wave_20: 20, wave_30: 30, wave_50: 50 } as const;
const GOLD_BARON_THRESHOLD = 1000;
const PACK_LEADER_SIZE = 6;
const VETERAN_LEVEL = 3;
const VETERAN_COUNT = 3;
const HERO_ITEMS_THRESHOLD = 3;
const FORTIFIED_WALL_COUNT = 3;
const BLACKSMITH_MAX_LEVEL = 2;

interface AchievementTrackingParams {
  killCount: number;
  wave: number;
  totalGold: number;
  workers: WorkerState[];
  heroItems: HeroItem[];
  placedBuildings: PlacedBuilding[];
  blacksmithUpgrades: { steelEdge: number; ironHide: number };
  onAchievement: (id: string) => void;
}

/**
 * Watches game-state milestones and fires onAchievement when they are met.
 * Pure side-effect hook — returns nothing.
 */
export function useAchievementTracking({
  killCount,
  wave,
  totalGold,
  workers,
  heroItems,
  placedBuildings,
  blacksmithUpgrades,
  onAchievement,
}: AchievementTrackingParams): void {
  // Kill milestones
  useEffect(() => {
    if (killCount >= KILLS.first_blood) onAchievement('first_blood');
    if (killCount >= KILLS.kill_100) onAchievement('kill_100');
    if (killCount >= KILLS.kill_500) onAchievement('kill_500');
  }, [killCount, onAchievement]);

  // Wave milestones
  useEffect(() => {
    if (wave >= WAVES.wave_10) onAchievement('wave_10');
    if (wave >= WAVES.wave_20) onAchievement('wave_20');
    if (wave >= WAVES.wave_30) onAchievement('wave_30');
    if (wave >= WAVES.wave_50) onAchievement('wave_50');
  }, [wave, onAchievement]);

  // Total gold earned
  useEffect(() => {
    if (totalGold >= GOLD_BARON_THRESHOLD) onAchievement('gold_baron');
  }, [totalGold, onAchievement]);

  // Unit count and veterancy
  useEffect(() => {
    if (workers.length >= PACK_LEADER_SIZE) onAchievement('pack_leader');
    const level3Count = workers.filter(w => w.level >= VETERAN_LEVEL).length;
    if (level3Count >= VETERAN_COUNT) onAchievement('veteran_corps');
  }, [workers, onAchievement]);

  // Hero items
  useEffect(() => {
    if (heroItems.length >= HERO_ITEMS_THRESHOLD)
      onAchievement('hero_equipped');
  }, [heroItems, onAchievement]);

  // Buildings — fortified (3+ walls)
  useEffect(() => {
    const wallCount = placedBuildings.filter(b => b.type === 'wall').length;
    if (wallCount >= FORTIFIED_WALL_COUNT) onAchievement('fortified');
  }, [placedBuildings, onAchievement]);

  // Blacksmith max upgrades
  useEffect(() => {
    if (
      blacksmithUpgrades.steelEdge >= BLACKSMITH_MAX_LEVEL ||
      blacksmithUpgrades.ironHide >= BLACKSMITH_MAX_LEVEL
    ) {
      onAchievement('blacksmith_max');
    }
  }, [blacksmithUpgrades, onAchievement]);
}
