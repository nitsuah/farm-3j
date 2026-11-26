import { describe, expect, it } from 'vitest';
import { canAfford, fmtCost } from '../buildMenuHelpers';

const cost = { gold: 10, lumber: 5, stone: 3 };

describe('canAfford', () => {
  it('is true when resources equal or exceed the cost', () => {
    expect(canAfford({ gold: 10, lumber: 5, stone: 3 }, cost)).toBe(true);
    expect(canAfford({ gold: 99, lumber: 99, stone: 99 }, cost)).toBe(true);
  });

  it.each([
    ['gold', { gold: 9, lumber: 5, stone: 3 }],
    ['lumber', { gold: 10, lumber: 4, stone: 3 }],
    ['stone', { gold: 10, lumber: 5, stone: 2 }],
  ])('is false when only %s is one short', (_name, resources) => {
    expect(canAfford(resources, cost)).toBe(false);
  });

  it('is true for a zero cost with zero resources', () => {
    expect(
      canAfford(
        { gold: 0, lumber: 0, stone: 0 },
        { gold: 0, lumber: 0, stone: 0 },
      ),
    ).toBe(true);
  });
});

describe('fmtCost', () => {
  it.each([
    [{ gold: 50, lumber: 20, stone: 0 }, '50🪙 20🌲'],
    [{ gold: 50, lumber: 20, stone: 5 }, '50🪙 20🌲 5🪨'],
    [{ gold: 0, lumber: 0, stone: 5 }, '5🪨'],
    [{ gold: 0, lumber: 0, stone: 0 }, ''],
  ])('formats %j as %j', (input, expected) => {
    expect(fmtCost(input)).toBe(expected);
  });
});
