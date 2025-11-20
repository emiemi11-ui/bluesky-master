/**
 * Military Calculations Utilities
 */

import { Position, Coords } from '../types';

/**
 * Calculate distance between two positions (2D)
 */
export function calculateDistance(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance between two coordinates (lat/lon)
 * Using Haversine formula
 */
export function calculateGeoDistance(from: Coords, to: Coords): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = from.lat * Math.PI / 180;
  const φ2 = to.lat * Math.PI / 180;
  const Δφ = (to.lat - from.lat) * Math.PI / 180;
  const Δλ = (to.lon - from.lon) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate azimuth (bearing) from one position to another
 * Returns angle in degrees (0-360)
 */
export function calculateAzimuth(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let azimuth = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (azimuth < 0) azimuth += 360;
  return azimuth;
}

/**
 * Convert degrees to mils (military angular unit)
 * 6400 mils = 360 degrees
 */
export function degreesToMils(degrees: number): number {
  return degrees * (6400 / 360);
}

/**
 * Convert mils to degrees
 */
export function milsToDegrees(mils: number): number {
  return mils * (360 / 6400);
}

/**
 * Calculate if position is within range of unit
 */
export function isInRange(
  unitPos: Position,
  targetPos: Position,
  range: number
): boolean {
  return calculateDistance(unitPos, targetPos) <= range;
}

/**
 * Calculate if unit can see target (simple line of sight)
 * More complex LOS would account for terrain elevation
 */
export function hasLineOfSight(
  observer: Position,
  target: Position,
  maxRange: number
): boolean {
  const distance = calculateDistance(observer, target);
  if (distance > maxRange) return false;

  // TODO: Add terrain occlusion check
  return true;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

/**
 * Calculate angle difference (shortest path)
 */
export function angleDifference(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;
  return diff;
}

/**
 * Check if target is in frontal arc (±90 degrees from facing)
 */
export function isInFrontalArc(
  unitPos: Position,
  unitFacing: number,
  targetPos: Position,
  arcWidth: number = 90
): boolean {
  const azimuth = calculateAzimuth(unitPos, targetPos);
  const diff = Math.abs(angleDifference(unitFacing, azimuth));
  return diff <= arcWidth;
}

/**
 * Calculate interpolated position along path
 */
export function interpolatePosition(
  from: Position,
  to: Position,
  t: number // 0-1
): Position {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    elevation: from.elevation && to.elevation
      ? from.elevation + (to.elevation - from.elevation) * t
      : undefined
  };
}

/**
 * Generate random number in range
 */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert grid coordinates to MGRS format (simplified)
 */
export function toMGRS(x: number, y: number): string {
  const gridX = Math.floor(x / 100);
  const gridY = Math.floor(y / 100);
  const localX = Math.floor(x % 100);
  const localY = Math.floor(y % 100);
  return `38T ML ${gridX.toString().padStart(5, '0')} ${gridY.toString().padStart(5, '0')}`;
}
