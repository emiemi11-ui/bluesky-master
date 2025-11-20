/**
 * Military Unit Types and Interfaces
 * Used across all CAX simulators
 */

export type UnitType =
  | 'INFANTRY'
  | 'MECHANIZED_INFANTRY'
  | 'ARMOR'
  | 'ARTILLERY'
  | 'RECON'
  | 'ENGINEER'
  | 'AVIATION'
  | 'LOGISTICS'
  | 'MEDICAL'
  | 'COMMAND';

export type UnitSize =
  | 'TEAM'      // 4 soldiers
  | 'SQUAD'     // 9-12 soldiers
  | 'PLATOON'   // 30-40 soldiers
  | 'COMPANY'   // 100-200 soldiers
  | 'BATTALION' // 500-1000 soldiers
  | 'BRIGADE'   // 3000-5000 soldiers
  | 'DIVISION'  // 10000-20000 soldiers
  | 'CORPS';    // 30000+ soldiers

export type Team = 'FRIENDLY' | 'ENEMY' | 'NEUTRAL' | 'UNKNOWN';

export type UnitStatus =
  | 'IDLE'
  | 'MOVING'
  | 'ENGAGING'
  | 'RETREATING'
  | 'DESTROYED'
  | 'PINNED'
  | 'SUPPRESSED';

export interface Position {
  x: number;
  y: number;
  elevation?: number; // meters above sea level
}

export interface Coords {
  lat: number;
  lon: number;
  elevation: number;
}

export interface MilitaryUnit {
  id: string;
  type: UnitType;
  size: UnitSize;
  team: Team;
  designation: string; // e.g., "A-2-5" (Alpha Company, 2nd Platoon, 5th Squad)

  // Personnel/Equipment
  count: number;        // number of soldiers/vehicles
  maxCount: number;     // original strength

  // Status
  health: number;       // 0-100%
  morale: number;       // 0-100%
  ammunition: number;   // 0-100%
  fuel: number;         // 0-100%
  status: UnitStatus;

  // Position and Movement
  position: Position;
  facing: number;       // direction 0-360 degrees
  destination?: Position;
  movementPath?: Position[];

  // Combat Capabilities
  speed: number;        // km/h
  firepower: number;    // attack rating
  armor: number;        // defense rating
  detectionRange: number;  // meters
  weaponRange: number;     // meters

  // Current Orders
  currentOrder?: Order;
  orderQueue?: Order[];

  // State tracking
  lastCombatTime?: number;
  suppressedUntil?: number;
  casualties?: number;
}

export interface Order {
  id: string;
  unitId: string;
  type: CommandType;
  target?: Position | string; // Position or target unit ID
  parameters?: Record<string, any>;
  priority: number; // 1-5 (1 = highest)
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  issuedAt: number;
  completedAt?: number;
}

export enum CommandType {
  MOVE = 'MOVE',
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  FLANK = 'FLANK',
  RETREAT = 'RETREAT',
  SUPPRESS = 'SUPPRESS',
  RECON = 'RECON',
  ARTILLERY_STRIKE = 'ARTILLERY_STRIKE',
  HOLD = 'HOLD',
  RESUPPLY = 'RESUPPLY'
}

// Unit templates with realistic stats
export const UNIT_TEMPLATES: Record<UnitType, Partial<MilitaryUnit>> = {
  INFANTRY: {
    speed: 5,          // 5 km/h on foot
    firepower: 3,
    armor: 1,
    detectionRange: 400,
    weaponRange: 400,
    count: 30
  },
  MECHANIZED_INFANTRY: {
    speed: 40,
    firepower: 5,
    armor: 3,
    detectionRange: 600,
    weaponRange: 600,
    count: 30
  },
  ARMOR: {
    speed: 50,
    firepower: 10,
    armor: 10,
    detectionRange: 2000,
    weaponRange: 2000,
    count: 4  // 4 tanks per platoon
  },
  ARTILLERY: {
    speed: 30,
    firepower: 15,
    armor: 2,
    detectionRange: 1000,
    weaponRange: 15000, // 15km indirect fire
    count: 6  // 6 guns per battery
  },
  RECON: {
    speed: 70,
    firepower: 2,
    armor: 2,
    detectionRange: 3000,
    weaponRange: 800,
    count: 2  // 2 vehicles
  },
  ENGINEER: {
    speed: 35,
    firepower: 2,
    armor: 2,
    detectionRange: 500,
    weaponRange: 300,
    count: 20
  },
  AVIATION: {
    speed: 200,
    firepower: 12,
    armor: 3,
    detectionRange: 5000,
    weaponRange: 4000,
    count: 2  // 2 helicopters
  },
  LOGISTICS: {
    speed: 40,
    firepower: 1,
    armor: 1,
    detectionRange: 500,
    weaponRange: 100,
    count: 10
  },
  MEDICAL: {
    speed: 40,
    firepower: 0,
    armor: 1,
    detectionRange: 500,
    weaponRange: 0,
    count: 8
  },
  COMMAND: {
    speed: 40,
    firepower: 2,
    armor: 2,
    detectionRange: 1000,
    weaponRange: 500,
    count: 15
  }
};
