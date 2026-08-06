export type ResourceCost = { gold: number; lumber: number; stone: number };

export function canAfford(
  resources: { gold: number; lumber: number; stone: number },
  cost: ResourceCost
): boolean {
  return (
    resources.gold >= cost.gold &&
    resources.lumber >= cost.lumber &&
    resources.stone >= cost.stone
  );
}

export function fmtCost(c: ResourceCost): string {
  return [
    c.gold > 0 && `${c.gold}🪙`,
    c.lumber > 0 && `${c.lumber}🌲`,
    c.stone > 0 && `${c.stone}🪨`,
  ]
    .filter(Boolean)
    .join(' ');
}
