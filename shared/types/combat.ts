/**
 * Combat System Types
 */

import { MilitaryUnit } from './units';
import { TerrainType, WeatherCondition, TimeOfDay } from './terrain';

export interface CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  winner: 'ATTACKER' | 'DEFENDER' | 'DRAW';
  moraleDamage: number;
  ammunitionUsed: number;
  duration: number; // seconds
  casualtyRatio: number;
}

export interface CombatEngagement {
  id: string;
  attacker: MilitaryUnit;
  defender: MilitaryUnit;
  terrain: TerrainType;
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  startTime: number;
  endTime?: number;
  result?: CombatResult;
  ongoing: boolean;
}

export interface CombatModifiers {
  terrainAttackMod: number;
  terrainDefenseMod: number;
  weatherMod: number;
  timeMod: number;
  moraleMod: number;
  elevationMod: number;
  flankingMod: number;
  suppressionMod: number;
}

export interface DamageCalculation {
  baseDamage: number;
  modifiedDamage: number;
  actualCasualties: number;
  penetration: boolean; // did attack penetrate armor?
}

// Combat events for logging
export type CombatEventType =
  | 'ENGAGEMENT_START'
  | 'ENGAGEMENT_END'
  | 'CASUALTIES_INFLICTED'
  | 'UNIT_DESTROYED'
  | 'UNIT_RETREATING'
  | 'UNIT_SUPPRESSED'
  | 'AMMUNITION_DEPLETED'
  | 'MORALE_BREAK';

export interface CombatEvent {
  type: CombatEventType;
  timestamp: number;
  unitId: string;
  message: string;
  data?: Record<string, any>;
}
