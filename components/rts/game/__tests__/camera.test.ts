import { describe, expect, it } from 'vitest';
import { cameraForTile } from '../camera';
import { TILE_SIZE } from '../constants';
import { tileToSvg } from '../map';

describe('cameraForTile', () => {
  const view = {
    width: 1000,
    height: 500,
    viewBoxWidth: 2000,
    viewBoxHeight: 2000,
    zoom: 1.5,
  };

  it('puts the tile centre in the middle of the viewport', () => {
    const camera = cameraForTile(2, 2, view);
    const { isoX, isoY } = tileToSvg(2, 2);
    const scale = Math.min(1000 / 2000, 500 / 2000) * 1.5;
    expect(camera.x + (isoX + TILE_SIZE / 2 - 1000) * scale).toBeCloseTo(0);
    expect(camera.y + (isoY + TILE_SIZE / 4 - 1000) * scale).toBeCloseTo(0);
  });

  it('needs no offset for a point already at the centre', () => {
    const { isoX, isoY } = tileToSvg(0, 0);
    const centred = {
      ...view,
      viewBoxWidth: (isoX + TILE_SIZE / 2) * 2,
      viewBoxHeight: (isoY + TILE_SIZE / 4) * 2,
    };
    const camera = cameraForTile(0, 0, centred);
    expect(Math.abs(camera.x)).toBeCloseTo(0);
    expect(Math.abs(camera.y)).toBeCloseTo(0);
  });
});
