'use client';
import { useEffect } from 'react';

import type { HeroItem, PlacedBuilding, WorkerState } from '../game/types';

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
    if (killCount >= 1) onAchievement('first_blood');
    if (killCount >= 100) onAchievement('kill_100');
    if (killCount >= 500) onAchievement('kill_500');
  }, [killCount, onAchievement]);

  // Wave milestones
  useEffect(() => {
    if (wave >= 10) onAchievement('wave_10');
    if (wave >= 20) onAchievement('wave_20');
    if (wave >= 30) onAchievement('wave_30');
    if (wave >= 50) onAchievement('wave_50');
  }, [wave, onAchievement]);

  // Total gold earned
  useEffect(() => {
    if (totalGold >= 1000) onAchievement('gold_baron');
  }, [totalGold, onAchievement]);

  // Unit count and veterancy
  useEffect(() => {
    if (workers.length >= 6) onAchievement('pack_leader');
    const level3Count = workers.filter(w => w.level >= 3).length;
    if (level3Count >= 3) onAchievement('veteran_corps');
  }, [workers, onAchievement]);

  // Hero items
  useEffect(() => {
    if (heroItems.length >= 3) onAchievement('hero_equipped');
  }, [heroItems, onAchievement]);

  // Buildings — fortified (3+ walls)
  useEffect(() => {
    const wallCount = placedBuildings.filter(b => b.type === 'wall').length;
    if (wallCount >= 3) onAchievement('fortified');
  }, [placedBuildings, onAchievement]);

  // Blacksmith max upgrades
  useEffect(() => {
    if (blacksmithUpgrades.steelEdge >= 2 || blacksmithUpgrades.ironHide >= 2) {
      onAchievement('blacksmith_max');
    }
  }, [blacksmithUpgrades, onAchievement]);
}
