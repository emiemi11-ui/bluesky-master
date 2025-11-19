/**
 * Terrain and Map Types
 */

export type TerrainType =
  | 'OPEN'      // Open field
  | 'FOREST'    // Woods/trees
  | 'URBAN'     // Buildings/city
  | 'HILL'      // Elevated terrain
  | 'WATER'     // Rivers/lakes
  | 'ROAD'      // Paved road
  | 'MOUNTAIN'  // Very high terrain
  | 'SWAMP';    // Wetlands

export interface Terrain {
  type: TerrainType;
  elevation: number;     // meters
  coverValue: number;    // 0-1 (0 = no cover, 1 = full cover)
  concealmentValue: number; // 0-1 (0 = visible, 1 = hidden)
  movementModifier: number; // multiplier for movement speed
}

export interface TerrainCell extends Terrain {
  x: number;
  y: number;
}

// Terrain modifiers for combat
export const TERRAIN_MODIFIERS: Record<TerrainType, {
  attack: number;
  defense: number;
  movement: number;
  visibility: number;
}> = {
  OPEN: {
    attack: 1.3,
    defense: 0.8,
    movement: 1.0,
    visibility: 1.0
  },
  FOREST: {
    attack: 0.7,
    defense: 1.3,
    movement: 0.6,
    visibility: 0.5
  },
  URBAN: {
    attack: 0.6,
    defense: 1.6,
    movement: 0.5,
    visibility: 0.4
  },
  HILL: {
    attack: 0.9,
    defense: 1.4,
    movement: 0.7,
    visibility: 1.2
  },
  WATER: {
    attack: 0.0,
    defense: 0.0,
    movement: 0.0,
    visibility: 1.0
  },
  ROAD: {
    attack: 1.0,
    defense: 0.7,
    movement: 1.5,
    visibility: 1.0
  },
  MOUNTAIN: {
    attack: 0.5,
    defense: 2.0,
    movement: 0.3,
    visibility: 1.5
  },
  SWAMP: {
    attack: 0.8,
    defense: 1.0,
    movement: 0.3,
    visibility: 0.7
  }
};

export type WeatherCondition = 'CLEAR' | 'RAIN' | 'FOG' | 'SNOW' | 'STORM';

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;  // Celsius
  windSpeed: number;    // m/s
  windDirection: number; // degrees
  visibility: number;   // meters
  precipitation: number; // mm/hour
  humidity: number;     // percentage
  pressure: number;     // hPa
}

export const WEATHER_EFFECTS: Record<WeatherCondition, {
  visibilityMultiplier: number;
  movementMultiplier: number;
  combatMultiplier: number;
}> = {
  CLEAR: {
    visibilityMultiplier: 1.0,
    movementMultiplier: 1.0,
    combatMultiplier: 1.0
  },
  RAIN: {
    visibilityMultiplier: 0.7,
    movementMultiplier: 0.8,
    combatMultiplier: 0.8
  },
  FOG: {
    visibilityMultiplier: 0.3,
    movementMultiplier: 0.9,
    combatMultiplier: 0.6
  },
  SNOW: {
    visibilityMultiplier: 0.5,
    movementMultiplier: 0.6,
    combatMultiplier: 0.7
  },
  STORM: {
    visibilityMultiplier: 0.4,
    movementMultiplier: 0.7,
    combatMultiplier: 0.5
  }
};

export type TimeOfDay = 'DAY' | 'DAWN' | 'DUSK' | 'NIGHT';

export const TIME_EFFECTS: Record<TimeOfDay, {
  visibilityMultiplier: number;
}> = {
  DAY: { visibilityMultiplier: 1.0 },
  DAWN: { visibilityMultiplier: 0.7 },
  DUSK: { visibilityMultiplier: 0.7 },
  NIGHT: { visibilityMultiplier: 0.3 }
};
