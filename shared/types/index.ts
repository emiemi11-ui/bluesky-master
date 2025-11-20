/**
 * Shared Types Index
 * Export all types used across CAX simulators
 */

export * from './units';
export * from './terrain';
export * from './combat';
export * from './mission';

// Explicit type re-exports for bundler compatibility
export type { WeatherCondition, TimeOfDay, WeatherData, TerrainType, Terrain, TerrainCell } from './terrain';
export type { UnitType, CommandType, Position, MilitaryUnit, UnitSize, UnitStatus } from './units';
export type { CombatResult } from './combat';
export type { MissionType, ObjectiveStatus, Objective, Mission, MissionResult } from './mission';
