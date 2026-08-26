import { describe, it, expect } from 'vitest';
import { TECH_TREE } from '../techTree';

describe('TECH_TREE', () => {
  it('has 4 tech nodes', () => {
    expect(TECH_TREE).toHaveLength(4);
  });

  it('each node has required fields', () => {
    for (const node of TECH_TREE) {
      expect(typeof node.id).toBe('string');
      expect(typeof node.name).toBe('string');
      expect(typeof node.description).toBe('string');
      expect(typeof node.cost).toBe('object');
      expect(Array.isArray(node.prerequisites)).toBe(true);
      expect(typeof node.unlocked).toBe('boolean');
      expect(typeof node.effect).toBe('function');
    }
  });

  it('all nodes start unlocked=false', () => {
    for (const node of TECH_TREE) {
      expect(node.unlocked).toBe(false);
    }
  });

  it('effect functions are callable without throwing', () => {
    for (const node of TECH_TREE) {
      expect(() => node.effect()).not.toThrow();
    }
  });

  it('tractor-unlock has no prerequisites', () => {
    const tractor = TECH_TREE.find(n => n.id === 'tractor-unlock');
    expect(tractor).toBeDefined();
    expect(tractor!.prerequisites).toHaveLength(0);
  });

  it('barn-upgrade requires tractor-unlock', () => {
    const barn = TECH_TREE.find(n => n.id === 'barn-upgrade');
    expect(barn).toBeDefined();
    expect(barn!.prerequisites).toContain('tractor-unlock');
  });

  it('animal-ability requires barn-upgrade', () => {
    const ability = TECH_TREE.find(n => n.id === 'animal-ability');
    expect(ability).toBeDefined();
    expect(ability!.prerequisites).toContain('barn-upgrade');
  });
});
