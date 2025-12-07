'use client';

import { useEffect } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';

export function KeyboardControls() {
  const { state, dispatch } = useFarm();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if typing in input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'p':
          // Space or P to pause/resume
          event.preventDefault();
          dispatch({ type: 'TOGGLE_PAUSE' });
          break;

        case 'r':
          // R to repair fences (if affordable)
          if (state.money >= 50 && state.fenceHealth < 100) {
            dispatch({
              type: 'UPDATE_STATS',
              payload: {
                fenceHealth: Math.min(100, state.fenceHealth + 20),
                money: state.money - 50,
              },
            });
          }
          break;

        case 'h':
          // H to heal animals (if affordable)
          if (state.money >= 100 && state.animalHealth < 100) {
            dispatch({
              type: 'UPDATE_STATS',
              payload: {
                animalHealth: Math.min(100, state.animalHealth + 30),
                money: state.money - 100,
              },
            });
          }
          break;

        case '?':
          // ? to show tutorial
          localStorage.removeItem('farm-tycoon-tutorial-seen');
          window.location.reload();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state, dispatch]);

  return null; // This component only handles keyboard events
}
