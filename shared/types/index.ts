/**
 * Shared Types Index
 * Export all types used across CAX simulators
 */

// Re-export all types from each module
export * from './units';
export * from './terrain';
export * from './combat';
export * from './mission';

// Explicit type re-exports for bundler compatibility
export type { WeatherCondition, TimeOfDay, TerrainType, Terrain, TerrainCell, WeatherData } from './terrain';
export { TERRAIN_MODIFIERS, WEATHER_EFFECTS, TIME_EFFECTS } from './terrain';
