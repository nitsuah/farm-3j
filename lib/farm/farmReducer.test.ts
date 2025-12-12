import { describe, it, expect } from 'vitest';
import { farmReducer, initialFarmState } from './farmReducer';
import { FarmAction, Entity } from './types';

describe('FarmReducer', () => {
  describe('Initial State', () => {
    it('has correct initial money', () => {
      expect(initialFarmState.money).toBe(5876);
    });

    it('has correct initial day', () => {
      expect(initialFarmState.day).toBe(27);
    });

    it('has initial entities including barn and fences', () => {
      expect(initialFarmState.entities.length).toBeGreaterThan(0);
      const barn = initialFarmState.entities.find(e => e.type === 'barn');
      expect(barn).toBeDefined();
      expect(barn?.id).toBe('barn-1');
    });

    it('has initial resources', () => {
      expect(initialFarmState.resources).toEqual({
        milk: 15,
        eggs: 42,
        meat: 8,
        wool: 12,
      });
    });

    it('starts unpaused', () => {
      expect(initialFarmState.isPaused).toBe(false);
    });

    it('has fence perimeter in initial state', () => {
      const fences = initialFarmState.entities.filter(e => e.type === 'fence');
      expect(fences.length).toBeGreaterThan(0);
    });
  });

  describe('SPAWN_ANIMAL Action', () => {
    it('adds new animal to entities', () => {
      const newAnimal: Entity = {
        id: 'cow-1',
        type: 'cow',
        x: 50,
        y: 50,
      };

      const action: FarmAction = {
        type: 'SPAWN_ANIMAL',
        payload: newAnimal,
      };

      const newState = farmReducer(initialFarmState, action);

      expect(newState.entities).toHaveLength(
        initialFarmState.entities.length + 1
      );
      expect(newState.entities).toContainEqual(newAnimal);
    });

    it('preserves existing entities when spawning', () => {
      const originalLength = initialFarmState.entities.length;
      const newAnimal: Entity = {
        id: 'chicken-1',
        type: 'chicken',
        x: 30,
        y: 30,
      };

      const action: FarmAction = {
        type: 'SPAWN_ANIMAL',
        payload: newAnimal,
      };

      const newState = farmReducer(initialFarmState, action);

      expect(newState.entities).toHaveLength(originalLength + 1);
      // Check all original entities still exist
      initialFarmState.entities.forEach(entity => {
        expect(newState.entities).toContainEqual(entity);
      });
    });
  });

  describe('SPAWN_STATIC Action', () => {
    it('adds static entity to entities', () => {
      const trough: Entity = {
        id: 'trough-1',
        type: 'trough',
        x: 40,
        y: 40,
      };

      const action: FarmAction = {
        type: 'SPAWN_STATIC',
        payload: trough,
      };

      const newState = farmReducer(initialFarmState, action);

      expect(newState.entities).toContainEqual(trough);
    });
  });

  describe('UPDATE_POSITION Action', () => {
    it('updates entity position', () => {
      // First spawn an animal
      const animal: Entity = {
        id: 'pig-1',
        type: 'pig',
        x: 50,
        y: 50,
      };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal,
      });

      // Now update its position
      const updateAction: FarmAction = {
        type: 'UPDATE_POSITION',
        payload: {
          id: 'pig-1',
          x: 60,
          y: 65,
        },
      };

      state = farmReducer(state, updateAction);

      const updatedEntity = state.entities.find(e => e.id === 'pig-1');
      expect(updatedEntity?.x).toBe(60);
      expect(updatedEntity?.y).toBe(65);
    });

    it('updates entity direction when provided', () => {
      const animal: Entity = {
        id: 'sheep-1',
        type: 'sheep',
        x: 50,
        y: 50,
        direction: 0,
      };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal,
      });

      const updateAction: FarmAction = {
        type: 'UPDATE_POSITION',
        payload: {
          id: 'sheep-1',
          x: 55,
          y: 55,
          direction: 90,
        },
      };

      state = farmReducer(state, updateAction);

      const updatedEntity = state.entities.find(e => e.id === 'sheep-1');
      expect(updatedEntity?.direction).toBe(90);
    });

    it('preserves existing direction when not provided', () => {
      const animal: Entity = {
        id: 'cow-1',
        type: 'cow',
        x: 50,
        y: 50,
        direction: 45,
      };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal,
      });

      const updateAction: FarmAction = {
        type: 'UPDATE_POSITION',
        payload: {
          id: 'cow-1',
          x: 55,
          y: 55,
        },
      };

      state = farmReducer(state, updateAction);

      const updatedEntity = state.entities.find(e => e.id === 'cow-1');
      expect(updatedEntity?.direction).toBe(45);
    });

    it('does not affect other entities', () => {
      const animal1: Entity = { id: 'cow-1', type: 'cow', x: 30, y: 30 };
      const animal2: Entity = { id: 'pig-1', type: 'pig', x: 70, y: 70 };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal1,
      });
      state = farmReducer(state, {
        type: 'SPAWN_ANIMAL',
        payload: animal2,
      });

      const updateAction: FarmAction = {
        type: 'UPDATE_POSITION',
        payload: { id: 'cow-1', x: 40, y: 40 },
      };

      state = farmReducer(state, updateAction);

      const pig = state.entities.find(e => e.id === 'pig-1');
      expect(pig?.x).toBe(70);
      expect(pig?.y).toBe(70);
    });
  });

  describe('BATCH_UPDATE_POSITIONS Action', () => {
    it('updates multiple entities at once', () => {
      const animal1: Entity = { id: 'cow-1', type: 'cow', x: 30, y: 30 };
      const animal2: Entity = { id: 'pig-1', type: 'pig', x: 70, y: 70 };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal1,
      });
      state = farmReducer(state, {
        type: 'SPAWN_ANIMAL',
        payload: animal2,
      });

      const batchUpdate: FarmAction = {
        type: 'BATCH_UPDATE_POSITIONS',
        payload: [
          { id: 'cow-1', x: 35, y: 35 },
          { id: 'pig-1', x: 75, y: 75 },
        ],
      };

      state = farmReducer(state, batchUpdate);

      const cow = state.entities.find(e => e.id === 'cow-1');
      const pig = state.entities.find(e => e.id === 'pig-1');

      expect(cow?.x).toBe(35);
      expect(cow?.y).toBe(35);
      expect(pig?.x).toBe(75);
      expect(pig?.y).toBe(75);
    });

    it('handles empty batch update', () => {
      const batchUpdate: FarmAction = {
        type: 'BATCH_UPDATE_POSITIONS',
        payload: [],
      };

      const newState = farmReducer(initialFarmState, batchUpdate);
      expect(newState.entities).toEqual(initialFarmState.entities);
    });
  });

  describe('REMOVE_ENTITY Action', () => {
    it('removes entity by id', () => {
      const animal: Entity = { id: 'chicken-1', type: 'chicken', x: 50, y: 50 };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal,
      });

      const removeAction: FarmAction = {
        type: 'REMOVE_ENTITY',
        payload: 'chicken-1',
      };

      state = farmReducer(state, removeAction);

      const removed = state.entities.find(e => e.id === 'chicken-1');
      expect(removed).toBeUndefined();
    });

    it('does not affect other entities when removing', () => {
      const originalLength = initialFarmState.entities.length;
      const animal: Entity = { id: 'sheep-1', type: 'sheep', x: 50, y: 50 };

      let state = farmReducer(initialFarmState, {
        type: 'SPAWN_ANIMAL',
        payload: animal,
      });

      state = farmReducer(state, {
        type: 'REMOVE_ENTITY',
        payload: 'sheep-1',
      });

      expect(state.entities).toHaveLength(originalLength);
    });

    it('handles removing non-existent entity gracefully', () => {
      const originalLength = initialFarmState.entities.length;

      const newState = farmReducer(initialFarmState, {
        type: 'REMOVE_ENTITY',
        payload: 'non-existent-id',
      });

      expect(newState.entities).toHaveLength(originalLength);
    });
  });

  describe('UPDATE_STATS Action', () => {
    it('updates money', () => {
      const action: FarmAction = {
        type: 'UPDATE_STATS',
        payload: { money: 10000 },
      };

      const newState = farmReducer(initialFarmState, action);
      expect(newState.money).toBe(10000);
    });

    it('updates day and time', () => {
      const action: FarmAction = {
        type: 'UPDATE_STATS',
        payload: { day: 30, time: 18.5 },
      };

      const newState = farmReducer(initialFarmState, action);
      expect(newState.day).toBe(30);
      expect(newState.time).toBe(18.5);
    });

    it('updates fence and animal health', () => {
      const action: FarmAction = {
        type: 'UPDATE_STATS',
        payload: { fenceHealth: 80, animalHealth: 95 },
      };

      const newState = farmReducer(initialFarmState, action);
      expect(newState.fenceHealth).toBe(80);
      expect(newState.animalHealth).toBe(95);
    });

    it('updates resources', () => {
      const action: FarmAction = {
        type: 'UPDATE_STATS',
        payload: {
          resources: { milk: 20, eggs: 50, meat: 10, wool: 15 },
        },
      };

      const newState = farmReducer(initialFarmState, action);
      expect(newState.resources).toEqual({
        milk: 20,
        eggs: 50,
        meat: 10,
        wool: 15,
      });
    });

    it('preserves entities when updating stats', () => {
      const action: FarmAction = {
        type: 'UPDATE_STATS',
        payload: { money: 999 },
      };

      const newState = farmReducer(initialFarmState, action);
      expect(newState.entities).toEqual(initialFarmState.entities);
    });
  });

  describe('TOGGLE_PAUSE Action', () => {
    it('toggles pause state', () => {
      expect(initialFarmState.isPaused).toBe(false);

      const newState = farmReducer(initialFarmState, {
        type: 'TOGGLE_PAUSE',
      });

      expect(newState.isPaused).toBe(true);
    });

    it('toggles back to unpaused', () => {
      let state = farmReducer(initialFarmState, { type: 'TOGGLE_PAUSE' });
      expect(state.isPaused).toBe(true);

      state = farmReducer(state, { type: 'TOGGLE_PAUSE' });
      expect(state.isPaused).toBe(false);
    });

    it('preserves all other state when toggling', () => {
      const newState = farmReducer(initialFarmState, { type: 'TOGGLE_PAUSE' });

      expect(newState.money).toBe(initialFarmState.money);
      expect(newState.entities).toEqual(initialFarmState.entities);
      expect(newState.resources).toEqual(initialFarmState.resources);
    });
  });

  describe('State Immutability', () => {
    it('does not mutate original state', () => {
      const originalEntitiesLength = initialFarmState.entities.length;
      const originalMoney = initialFarmState.money;

      farmReducer(initialFarmState, {
        type: 'UPDATE_STATS',
        payload: { money: 999 },
      });

      // Original state should not change
      expect(initialFarmState.money).toBe(originalMoney);
      expect(initialFarmState.entities).toHaveLength(originalEntitiesLength);
    });
  });

  describe('Complex State Transitions', () => {
    it('handles multiple actions in sequence', () => {
      let state = initialFarmState;

      // Spawn two animals
      state = farmReducer(state, {
        type: 'SPAWN_ANIMAL',
        payload: { id: 'cow-1', type: 'cow', x: 30, y: 30 },
      });

      state = farmReducer(state, {
        type: 'SPAWN_ANIMAL',
        payload: { id: 'pig-1', type: 'pig', x: 70, y: 70 },
      });

      // Update both positions
      state = farmReducer(state, {
        type: 'BATCH_UPDATE_POSITIONS',
        payload: [
          { id: 'cow-1', x: 35, y: 35 },
          { id: 'pig-1', x: 75, y: 75 },
        ],
      });

      // Update stats
      state = farmReducer(state, {
        type: 'UPDATE_STATS',
        payload: { money: 6000 },
      });

      // Verify final state
      expect(state.entities.find(e => e.id === 'cow-1')?.x).toBe(35);
      expect(state.entities.find(e => e.id === 'pig-1')?.x).toBe(75);
      expect(state.money).toBe(6000);
    });

    it('removes and spawns entities maintaining state integrity', () => {
      let state = initialFarmState;
      const originalLength = state.entities.length;

      // Spawn an animal
      state = farmReducer(state, {
        type: 'SPAWN_ANIMAL',
        payload: { id: 'temp-1', type: 'cow', x: 50, y: 50 },
      });

      expect(state.entities).toHaveLength(originalLength + 1);

      // Remove it
      state = farmReducer(state, {
        type: 'REMOVE_ENTITY',
        payload: 'temp-1',
      });

      expect(state.entities).toHaveLength(originalLength);
      expect(state.entities.find(e => e.id === 'temp-1')).toBeUndefined();
    });
  });
});
