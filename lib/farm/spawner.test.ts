import { describe, it, expect, beforeEach } from 'vitest';
import { spawnAnimal, spawnStatic } from './spawner';

describe('Spawner', () => {
  describe('spawnAnimal', () => {
    it('creates cow with correct properties', () => {
      const cow = spawnAnimal('cow');

      expect(cow.type).toBe('cow');
      expect(cow.velocity).toBe(0.5);
      expect(cow.hunger).toBe(0);
      expect(cow.happiness).toBe(100);
      expect(cow.inventory).toBe(0);
    });

    it('creates chicken with correct velocity', () => {
      const chicken = spawnAnimal('chicken');

      expect(chicken.type).toBe('chicken');
      expect(chicken.velocity).toBe(1.2);
    });

    it('creates pig with correct velocity', () => {
      const pig = spawnAnimal('pig');

      expect(pig.type).toBe('pig');
      expect(pig.velocity).toBe(0.7);
    });

    it('creates sheep with correct velocity', () => {
      const sheep = spawnAnimal('sheep');

      expect(sheep.type).toBe('sheep');
      expect(sheep.velocity).toBe(0.8);
    });

    it('spawns animal within safe bounds', () => {
      const animal = spawnAnimal('cow');

      expect(animal.x).toBeGreaterThanOrEqual(15);
      expect(animal.x).toBeLessThanOrEqual(85);
      expect(animal.y).toBeGreaterThanOrEqual(20);
      expect(animal.y).toBeLessThanOrEqual(80);
    });

    it('generates unique IDs for each animal', () => {
      const cow1 = spawnAnimal('cow');
      const cow2 = spawnAnimal('cow');

      expect(cow1.id).not.toBe(cow2.id);
      expect(cow1.id).toContain('cow-');
      expect(cow2.id).toContain('cow-');
    });

    it('sets random initial direction', () => {
      const animal = spawnAnimal('cow');

      expect(animal.direction).toBeGreaterThanOrEqual(0);
      expect(animal.direction).toBeLessThanOrEqual(Math.PI * 2);
    });

    it('initializes timestamps', () => {
      const before = Date.now();
      const animal = spawnAnimal('cow');
      const after = Date.now();

      expect(animal.lastUpdate).toBeGreaterThanOrEqual(before);
      expect(animal.lastUpdate).toBeLessThanOrEqual(after);
      expect(animal.lastProduced).toBeDefined();
      expect(animal.lastNeedUpdate).toBeDefined();
    });
  });

  describe('spawnStatic', () => {
    it('creates barn at specified position', () => {
      const barn = spawnStatic('barn', 50, 40);

      expect(barn.type).toBe('barn');
      expect(barn.x).toBe(50);
      expect(barn.y).toBe(40);
    });

    it('creates fence at specified position', () => {
      const fence = spawnStatic('fence', 10, 10);

      expect(fence.type).toBe('fence');
      expect(fence.x).toBe(10);
      expect(fence.y).toBe(10);
    });

    it('creates pond at specified position', () => {
      const pond = spawnStatic('pond', 75, 25);

      expect(pond.type).toBe('pond');
      expect(pond.x).toBe(75);
      expect(pond.y).toBe(25);
    });

    it('generates unique ID for static entities', () => {
      const barn1 = spawnStatic('barn', 50, 50);
      const barn2 = spawnStatic('barn', 50, 50);

      expect(barn1.id).not.toBe(barn2.id);
      expect(barn1.id).toContain('barn-');
    });
  });
});
