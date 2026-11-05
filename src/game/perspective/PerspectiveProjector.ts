export interface PerspectivePoint {
  x: number;
  z: number;
  elevation?: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
}

/** Shared projection for all world entities. z is normalized: 0 at the horizon, 1 near the camera. */
export class PerspectiveProjector {
  public static project(point: PerspectivePoint, width: number, height: number, horizonRatio = 0.28): ProjectedPoint {
    const depth = PhaserMathClamp(point.z, 0.02, 1);
    const horizon = height * horizonRatio;
    const perspective = Math.pow(depth, 1.62);
    const scale = 0.28 + depth * 0.92;
    return {
      x: width * 0.5 + point.x * width * 0.42 * scale,
      y: horizon + perspective * (height - horizon) * 0.88 - (point.elevation ?? 0) * scale,
      scale
    };
  }
}

function PhaserMathClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
