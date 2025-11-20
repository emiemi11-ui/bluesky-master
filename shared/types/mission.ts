/**
 * Mission and Objective Types
 */

import { Position } from './units';
import { TimeOfDay, WeatherCondition } from './terrain';

export type MissionType =
  | 'OFFENSIVE'
  | 'DEFENSIVE'
  | 'RECON'
  | 'DELAY'
  | 'COUNTERATTACK'
  | 'NIGHT_OPERATION'
  | 'URBAN_ASSAULT';

export type ObjectiveStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export interface Objective {
  id: string;
  name: string;
  description: string;
  position: Position;
  type: 'CAPTURE' | 'DEFEND' | 'DESTROY' | 'RECON' | 'SURVIVE';
  status: ObjectiveStatus;
  radius: number; // meters
  controlledBy?: 'FRIENDLY' | 'ENEMY';
  value: number; // victory points
  required: boolean; // is this objective required for victory?
}

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  description: string;
  briefing: string;
  duration: number; // seconds
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';

  objectives: Objective[];

  playerForces: {
    infantry: number;
    armor: number;
    artillery: number;
    recon: number;
  };

  enemyForces: {
    infantry: number;
    armor: number;
    artillery: number;
    recon: number;
  };

  mapSize: string; // e.g., "5km x 5km"
  startTime: TimeOfDay;
  weather: WeatherCondition;

  victoryConditions: string[];
  defeatConditions: string[];

  timeLimit?: number; // seconds
  casualtyLimit?: number; // max allowed casualties
}

export interface MissionResult {
  missionId: string;
  success: boolean;
  score: number; // 0-100

  statistics: {
    durationSeconds: number;
    playerCasualties: number;
    enemyCasualties: number;
    casualtyRatio: number;
    ammunitionUsed: number;
    fuelConsumed: number;
    objectivesCompleted: number;
    objectivesTotal: number;
  };

  tacticalAnalysis: {
    strongPoints: string[];
    weakPoints: string[];
    suggestions: string[];
  };

  timeline: CombatEvent[];
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface CombatEvent {
  timestamp: number;
  type: string;
  description: string;
  unitId?: string;
}
