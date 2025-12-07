'use client';

import { useEffect, useRef } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { addNotification } from '@/lib/farm/notifications';

export function FarmNotificationWatcher() {
  const { state } = useFarm();
  const lastFenceHealthRef = useRef(state.fenceHealth);
  const lastAnimalHealthRef = useRef(state.animalHealth);
  const lastMoneyRef = useRef(state.money);
  const lastDayRef = useRef(state.day);

  useEffect(() => {
    // Notify on new day
    if (state.day > lastDayRef.current) {
      addNotification(`📅 Day ${state.day} has begun!`, 'info', 3000);
      lastDayRef.current = state.day;
    }
  }, [state.day]);

  useEffect(() => {
    // Notify when fence health drops below threshold
    if (state.fenceHealth < 30 && lastFenceHealthRef.current >= 30) {
      addNotification(
        '⚠️ Fence health is critically low! Repair soon.',
        'warning',
        5000
      );
    }
    lastFenceHealthRef.current = state.fenceHealth;
  }, [state.fenceHealth]);

  useEffect(() => {
    // Notify when animal health drops below threshold
    if (state.animalHealth < 40 && lastAnimalHealthRef.current >= 40) {
      addNotification(
        '⚠️ Animal health is declining! Consider healing.',
        'warning',
        5000
      );
    }
    lastAnimalHealthRef.current = state.animalHealth;
  }, [state.animalHealth]);

  useEffect(() => {
    // Notify when money is running low
    if (state.money < 100 && lastMoneyRef.current >= 100) {
      addNotification(
        '💰 Low on funds! Sell resources to earn money.',
        'warning',
        5000
      );
    }

    // Notify on big money gains
    if (state.money > lastMoneyRef.current + 100) {
      addNotification(
        '💰 Big sale! Money increased significantly.',
        'success',
        3000
      );
    }

    lastMoneyRef.current = state.money;
  }, [state.money]);

  return null; // This component only watches state
}
