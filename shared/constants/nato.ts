/**
 * NATO Military Symbology (APP-6D)
 */

import { UnitType, UnitSize, Team } from '../types';

/**
 * Get NATO symbol character for unit type
 */
export function getNATOSymbol(type: UnitType): string {
  const symbols: Record<UnitType, string> = {
    INFANTRY: 'I',
    MECHANIZED_INFANTRY: 'M',
    ARMOR: 'A',
    ARTILLERY: '⚔',
    RECON: 'R',
    ENGINEER: 'E',
    AVIATION: '✈',
    LOGISTICS: 'L',
    MEDICAL: '+',
    COMMAND: 'C'
  };
  return symbols[type] || '?';
}

/**
 * Get size modifier symbol
 */
export function getSizeModifier(size: UnitSize): string {
  const modifiers: Record<UnitSize, string> = {
    TEAM: '•',
    SQUAD: '••',
    PLATOON: '•••',
    COMPANY: 'I',
    BATTALION: 'II',
    BRIGADE: 'X',
    DIVISION: 'XX',
    CORPS: 'XXX'
  };
  return modifiers[size] || '';
}

/**
 * Get affiliation color
 */
export function getAffiliationColor(team: Team): string {
  const colors: Record<Team, string> = {
    FRIENDLY: '#0066CC',  // Blue
    ENEMY: '#CC0000',     // Red
    NEUTRAL: '#00CC00',   // Green
    UNKNOWN: '#FFFF00'    // Yellow
  };
  return colors[team] || '#808080';
}

/**
 * Get full NATO designation
 */
export function getFullNATODesignation(
  type: UnitType,
  size: UnitSize,
  designation: string
): string {
  const symbol = getNATOSymbol(type);
  const sizeMod = getSizeModifier(size);
  return `${sizeMod} ${symbol} ${designation}`;
}

/**
 * NATO Symbol Frame Shapes
 */
export const NATO_FRAMES = {
  GROUND: 'rectangle',
  AIR: 'circle',
  SEA: 'trapezoid',
  SPECIAL: 'diamond'
} as const;

/**
 * Get frame shape for unit type
 */
export function getFrameShape(type: UnitType): string {
  if (type === 'AVIATION') return NATO_FRAMES.AIR;
  return NATO_FRAMES.GROUND;
}
