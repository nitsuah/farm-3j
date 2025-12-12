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

  describe('PRODUCE_RESOURCES Action', () => {
    it('tracks production time correctly', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          {
            id: 'cow1',
            type: 'cow' as const,
            x: 50,
            y: 50,
            inventory: 0,
            lastProduced: Date.now(),
          },
        ],
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      // Should not produce yet since just initialized
      expect(newState.entities[0]!.inventory).toBe(0);
    });

    it('does not produce if insufficient time has passed', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          {
            id: 'cow1',
            type: 'cow' as const,
            x: 50,
            y: 50,
            lastProduced: Date.now() - 1000, // 1 second ago
            inventory: 0,
          },
        ],
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      expect(newState.entities[0]!.inventory).toBe(0);
    });

    it('collects milk from cows', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          {
            id: 'cow1',
            type: 'cow' as const,
            x: 50,
            y: 50,
            inventory: 5,
          },
        ],
        resources: { milk: 10, eggs: 0, meat: 0, wool: 0 },
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      expect(newState.resources.milk).toBe(15);
      expect(newState.entities[0]!.inventory).toBe(0);
    });

    it('collects eggs from chickens', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          {
            id: 'chicken1',
            type: 'chicken' as const,
            x: 50,
            y: 50,
            inventory: 3,
          },
        ],
        resources: { milk: 0, eggs: 5, meat: 0, wool: 0 },
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      expect(newState.resources.eggs).toBe(8);
      expect(newState.entities[0]!.inventory).toBe(0);
    });

    it('collects meat from pigs', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          {
            id: 'pig1',
            type: 'pig' as const,
            x: 50,
            y: 50,
            inventory: 2,
          },
        ],
        resources: { milk: 0, eggs: 0, meat: 7, wool: 0 },
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      expect(newState.resources.meat).toBe(9);
      expect(newState.entities[0]!.inventory).toBe(0);
    });

    it('collects wool from sheep', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          {
            id: 'sheep1',
            type: 'sheep' as const,
            x: 50,
            y: 50,
            inventory: 4,
          },
        ],
        resources: { milk: 0, eggs: 0, meat: 0, wool: 12 },
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      expect(newState.resources.wool).toBe(16);
      expect(newState.entities[0]!.inventory).toBe(0);
    });

    it('handles multiple animals producing simultaneously', () => {
      const testState = {
        ...initialFarmState,
        entities: [
          { id: 'cow1', type: 'cow' as const, x: 50, y: 50, inventory: 2 },
          {
            id: 'chicken1',
            type: 'chicken' as const,
            x: 60,
            y: 60,
            inventory: 3,
          },
          { id: 'pig1', type: 'pig' as const, x: 70, y: 70, inventory: 1 },
        ],
        resources: { milk: 0, eggs: 0, meat: 0, wool: 0 },
      };

      const newState = farmReducer(testState, { type: 'PRODUCE_RESOURCES' });
      expect(newState.resources.milk).toBe(2);
      expect(newState.resources.eggs).toBe(3);
      expect(newState.resources.meat).toBe(1);
    });
  });

  describe('SELL_RESOURCE Action', () => {
    it('sells milk and increases money', () => {
      const testState = {
        ...initialFarmState,
        resources: { milk: 10, eggs: 0, meat: 0, wool: 0 },
        money: 100,
      };

      const newState = farmReducer(testState, {
        type: 'SELL_RESOURCE',
        payload: { resource: 'milk', amount: 5 },
      });

      expect(newState.resources.milk).toBe(5);
      expect(newState.money).toBe(150); // 5 milk × 10 = 50 + 100
    });

    it('sells eggs and increases money', () => {
      const testState = {
        ...initialFarmState,
        resources: { milk: 0, eggs: 20, meat: 0, wool: 0 },
        money: 50,
      };

      const newState = farmReducer(testState, {
        type: 'SELL_RESOURCE',
        payload: { resource: 'eggs', amount: 10 },
      });

      expect(newState.resources.eggs).toBe(10);
      expect(newState.money).toBe(100); // 10 eggs × 5 = 50 + 50
    });

    it('sells meat and increases money', () => {
      const testState = {
        ...initialFarmState,
        resources: { milk: 0, eggs: 0, meat: 8, wool: 0 },
        money: 0,
      };

      const newState = farmReducer(testState, {
        type: 'SELL_RESOURCE',
        payload: { resource: 'meat', amount: 3 },
      });

      expect(newState.resources.meat).toBe(5);
      expect(newState.money).toBe(60); // 3 meat × 20 = 60
    });

    it('sells wool and increases money', () => {
      const testState = {
        ...initialFarmState,
        resources: { milk: 0, eggs: 0, meat: 0, wool: 12 },
        money: 75,
      };

      const newState = farmReducer(testState, {
        type: 'SELL_RESOURCE',
        payload: { resource: 'wool', amount: 4 },
      });

      expect(newState.resources.wool).toBe(8);
      expect(newState.money).toBe(135); // 4 wool × 15 = 60 + 75
    });

    it('does not sell if insufficient resources', () => {
      const testState = {
        ...initialFarmState,
        resources: { milk: 3, eggs: 0, meat: 0, wool: 0 },
        money: 100,
      };

      const newState = farmReducer(testState, {
        type: 'SELL_RESOURCE',
        payload: { resource: 'milk', amount: 10 },
      });

      expect(newState.resources.milk).toBe(3); // Unchanged
      expect(newState.money).toBe(100); // Unchanged
    });
  });
});
