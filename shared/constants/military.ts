/**
 * Military Constants and Data
 */

/**
 * Standard military time increments
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
} as const;

/**
 * Distance conversions
 */
export const DISTANCE = {
  METERS_TO_KM: 0.001,
  KM_TO_METERS: 1000,
  METERS_TO_MILES: 0.000621371,
  MILES_TO_METERS: 1609.34
} as const;

/**
 * Combat ratios for force assessment
 */
export const COMBAT_RATIOS = {
  OVERWHELMING_SUPERIORITY: 3.0,
  SUPERIORITY: 1.5,
  EQUAL: 1.0,
  INFERIOR: 0.7,
  CRITICALLY_INFERIOR: 0.5
} as const;

/**
 * Morale thresholds
 */
export const MORALE = {
  EXCELLENT: 90,
  GOOD: 70,
  FAIR: 50,
  POOR: 30,
  BROKEN: 20
} as const;

/**
 * Supply thresholds
 */
export const SUPPLY = {
  FULL: 100,
  GOOD: 75,
  LOW: 40,
  CRITICAL: 20,
  EMPTY: 0
} as const;

/**
 * Casualty rate classifications
 */
export const CASUALTIES = {
  LIGHT: 0.1,    // < 10%
  MODERATE: 0.25, // < 25%
  HEAVY: 0.50,   // < 50%
  SEVERE: 0.75,  // < 75%
  CATASTROPHIC: 1.0 // 100%
} as const;

/**
 * Standard formation spacing (meters)
 */
export const FORMATIONS = {
  TEAM_SPACING: 5,
  SQUAD_SPACING: 10,
  PLATOON_SPACING: 50,
  COMPANY_SPACING: 100,
  BATTALION_SPACING: 300
} as const;

/**
 * Doctrine-based engagement ranges (meters)
 */
export const ENGAGEMENT_RANGES = {
  SMALL_ARMS: 400,
  MACHINE_GUN: 800,
  ANTI_TANK: 2000,
  TANK_MAIN_GUN: 2500,
  ARTILLERY_DIRECT: 3000,
  ARTILLERY_INDIRECT: 15000,
  MORTAR: 5000,
  MISSILE: 4000
} as const;

/**
 * Mission priority levels
 */
export const PRIORITY = {
  IMMEDIATE: 1,
  PRIORITY: 2,
  ROUTINE: 3,
  ON_CALL: 4,
  PLANNED: 5
} as const;

/**
 * Standard military grid sizes (meters)
 */
export const GRID = {
  TACTICAL: 100,     // 100m squares
  OPERATIONAL: 1000,  // 1km squares
  STRATEGIC: 10000   // 10km squares
} as const;
