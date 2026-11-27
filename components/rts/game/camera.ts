import { TILE_SIZE } from './constants';
import { tileToSvg } from './map';

export interface CameraView {
  /** Untransformed size of the map viewport in CSS pixels. */
  width: number;
  height: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  zoom: number;
}

/**
 * The CSS translate that puts a tile in the middle of the viewport. The map is
 * drawn with `meet` scaling and then `translate() scale()` about its centre.
 */
export function cameraForTile(tx: number, ty: number, view: CameraView) {
  const { isoX, isoY } = tileToSvg(tx, ty);
  const fit = Math.min(
    view.width / view.viewBoxWidth,
    view.height / view.viewBoxHeight
  );
  const scale = fit * view.zoom;
  return {
    x: -scale * (isoX + TILE_SIZE / 2 - view.viewBoxWidth / 2),
    y: -scale * (isoY + TILE_SIZE / 4 - view.viewBoxHeight / 2),
  };
}

/** Reads the view from the live map element; null until it has a size. */
export function readCameraView(svg: SVGSVGElement | null): CameraView | null {
  const box = svg?.viewBox?.baseVal;
  const parent = svg?.parentElement;
  if (!svg || !box || !parent?.clientWidth || !parent.clientHeight) return null;
  return {
    width: parent.clientWidth,
    height: parent.clientHeight,
    viewBoxWidth: box.width,
    viewBoxHeight: box.height,
    zoom: svg.getBoundingClientRect().width / parent.clientWidth || 1,
  };
}
