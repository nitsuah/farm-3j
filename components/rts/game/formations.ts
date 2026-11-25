export type FormationKind = "line" | "wedge" | "box";

export interface TileOffset {
  dx: number;
  dy: number;
}

export function getFormationOffsets(
  kind: FormationKind,
  count: number,
): TileOffset[] {
  if (count <= 0) return [];

  switch (kind) {
    case "line": {
      const offsets: TileOffset[] = [];
      const center = Math.floor((count - 1) / 2);
      for (let i = 0; i < count; i++) {
        offsets.push({ dx: i - center, dy: 0 });
      }
      return offsets;
    }
    case "box": {
      const offsets: TileOffset[] = [];
      const cols = Math.ceil(Math.sqrt(count));
      const colCenter = Math.floor((cols - 1) / 2);
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        offsets.push({ dx: col - colCenter, dy: row });
      }
      return offsets;
    }
    case "wedge": {
      const offsets: TileOffset[] = [];
      let remaining = count;
      let row = 0;
      while (remaining > 0) {
        const unitsInRow = Math.min(row + 1, remaining);
        for (let k = 0; k < unitsInRow; k++) {
          offsets.push({ dx: -row + 2 * k, dy: row });
        }
        remaining -= unitsInRow;
        row++;
      }
      return offsets;
    }
  }
}
