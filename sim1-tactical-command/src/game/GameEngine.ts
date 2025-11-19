/**
 * Main Game Engine - Orchestrates the entire simulation
 */

import {
  MilitaryUnit,
  Objective,
  Mission,
  WeatherCondition,
  TimeOfDay,
  TerrainType,
  TerrainCell,
  CommandType,
  Order,
  CombatEvent
} from '@shared/types';
import { calculateDistance } from '@shared/utils/calculations';
import { CombatEngine } from './CombatEngine';
import { TacticalAI } from './AIController';

export interface GameState {
  units: MilitaryUnit[];
  objectives: Objective[];
  terrain: TerrainCell[][];
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  elapsedTime: number; // seconds
  isPaused: boolean;
  gameSpeed: number; // 1x, 2x, 4x
  combatLog: CombatEvent[];
}

export class GameEngine {

  private state: GameState;
  private combatEngine: CombatEngine;
  private ai: TacticalAI;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 100; // ms (10 updates per second)

  constructor(mission: Mission) {
    this.combatEngine = new CombatEngine();
    this.ai = new TacticalAI(mission.difficulty as any);

    this.state = {
      units: [],
      objectives: mission.objectives,
      terrain: this.generateTerrain(1200, 800),
      weather: mission.weather,
      timeOfDay: mission.startTime,
      elapsedTime: 0,
      isPaused: false,
      gameSpeed: 1,
      combatLog: []
    };

    this.initializeUnits(mission);
  }

  /**
   * Initialize units from mission
   */
  private initializeUnits(mission: Mission): void {
    const units: MilitaryUnit[] = [];

    // Create player units
    const playerStartX = 200;
    const playerStartY = 400;

    for (let i = 0; i < mission.playerForces.infantry; i++) {
      units.push(this.createUnit('INFANTRY', 'FRIENDLY', i, playerStartX, playerStartY + i * 100));
    }

    for (let i = 0; i < mission.playerForces.armor; i++) {
      units.push(this.createUnit('ARMOR', 'FRIENDLY', i, playerStartX - 50, playerStartY + i * 120));
    }

    for (let i = 0; i < mission.playerForces.artillery; i++) {
      units.push(this.createUnit('ARTILLERY', 'FRIENDLY', i, playerStartX - 100, playerStartY + 200));
    }

    for (let i = 0; i < mission.playerForces.recon; i++) {
      units.push(this.createUnit('RECON', 'FRIENDLY', i, playerStartX + 100, playerStartY + i * 80));
    }

    // Create enemy units
    const enemyStartX = 1000;
    const enemyStartY = 400;

    for (let i = 0; i < mission.enemyForces.infantry; i++) {
      units.push(this.createUnit('INFANTRY', 'ENEMY', i, enemyStartX, enemyStartY + i * 100));
    }

    for (let i = 0; i < mission.enemyForces.armor; i++) {
      units.push(this.createUnit('ARMOR', 'ENEMY', i, enemyStartX + 50, enemyStartY + i * 120));
    }

    for (let i = 0; i < mission.enemyForces.artillery; i++) {
      units.push(this.createUnit('ARTILLERY', 'ENEMY', i, enemyStartX + 100, enemyStartY + 200));
    }

    this.state.units = units;
  }

  /**
   * Create a military unit
   */
  private createUnit(
    type: any,
    team: any,
    index: number,
    x: number,
    y: number
  ): MilitaryUnit {
    const baseStats = {
      INFANTRY: { speed: 5, firepower: 3, armor: 1, range: 400, count: 30 },
      ARMOR: { speed: 50, firepower: 10, armor: 10, range: 2000, count: 4 },
      ARTILLERY: { speed: 30, firepower: 15, armor: 2, range: 15000, count: 6 },
      RECON: { speed: 70, firepower: 2, armor: 2, range: 3000, count: 2 }
    };

    const stats = baseStats[type as keyof typeof baseStats];

    return {
      id: `${team}-${type}-${index}`,
      type,
      size: 'PLATOON',
      team,
      designation: `${team.charAt(0)}-${index + 1}`,
      count: stats.count,
      maxCount: stats.count,
      health: 100,
      morale: 80,
      ammunition: 100,
      fuel: 100,
      status: 'IDLE',
      position: { x, y, elevation: 0 },
      facing: team === 'FRIENDLY' ? 90 : 270,
      speed: stats.speed,
      firepower: stats.firepower,
      armor: stats.armor,
      detectionRange: stats.range,
      weaponRange: stats.range
    };
  }

  /**
   * Generate procedural terrain
   */
  private generateTerrain(width: number, height: number): TerrainCell[][] {
    const terrain: TerrainCell[][] = [];
    const cellSize = 20;

    for (let y = 0; y < height / cellSize; y++) {
      terrain[y] = [];
      for (let x = 0; x < width / cellSize; x++) {
        // Random terrain generation
        const rand = Math.random();
        let type: TerrainType = 'OPEN';

        if (rand < 0.15) type = 'FOREST';
        else if (rand < 0.25) type = 'HILL';
        else if (rand < 0.30) type = 'URBAN';
        else if (rand < 0.33) type = 'WATER';

        terrain[y][x] = {
          x,
          y,
          type,
          elevation: type === 'HILL' ? 20 : type === 'WATER' ? -5 : 0,
          coverValue: type === 'FOREST' ? 0.7 : type === 'URBAN' ? 0.9 : 0.2,
          concealmentValue: type === 'FOREST' ? 0.8 : type === 'URBAN' ? 0.6 : 0.1,
          movementModifier: type === 'WATER' ? 0 : type === 'FOREST' ? 0.6 : 1.0
        };
      }
    }

    return terrain;
  }

  /**
   * Main update loop
   */
  update(deltaTime: number): void {
    if (this.state.isPaused) return;

    const scaledDelta = deltaTime * this.state.gameSpeed;
    this.state.elapsedTime += scaledDelta / 1000;

    // Update AI decisions every 2 seconds
    if (Math.floor(this.state.elapsedTime) % 2 === 0) {
      this.updateAI();
    }

    // Update unit movement
    this.updateMovement(scaledDelta / 1000);

    // Process combat
    this.processCombat();

    // Update objectives
    this.updateObjectives();

    // Update time of day (optional)
    // this.updateTimeOfDay();
  }

  /**
   * Update AI decisions
   */
  private updateAI(): void {
    const orders = this.ai.makeDecision(this.state);

    orders.forEach(order => {
      const unit = this.state.units.find(u => u.id === order.unitId);
      if (unit) {
        unit.currentOrder = order;
        this.executeOrder(unit, order);
      }
    });
  }

  /**
   * Execute a unit order
   */
  private executeOrder(unit: MilitaryUnit, order: Order): void {
    switch (order.type) {
      case CommandType.MOVE:
        if (order.target && typeof order.target !== 'string') {
          unit.destination = order.target;
          unit.status = 'MOVING';
        }
        break;

      case CommandType.ATTACK:
        if (order.target) {
          unit.destination = typeof order.target === 'string'
            ? this.state.units.find(u => u.id === order.target)?.position
            : order.target;
          unit.status = 'MOVING';
        }
        break;

      case CommandType.DEFEND:
        if (order.target && typeof order.target !== 'string') {
          unit.destination = order.target;
          unit.status = 'MOVING';
        }
        break;

      case CommandType.RETREAT:
        if (order.target && typeof order.target !== 'string') {
          unit.destination = order.target;
          unit.status = 'RETREATING';
        }
        break;

      case CommandType.HOLD:
        unit.destination = undefined;
        unit.status = 'IDLE';
        break;
    }
  }

  /**
   * Update unit movement
   */
  private updateMovement(deltaTime: number): void {
    this.state.units.forEach(unit => {
      if (!unit.destination || unit.status === 'DESTROYED') return;

      const distance = calculateDistance(unit.position, unit.destination);

      // Arrived at destination
      if (distance < 5) {
        unit.destination = undefined;
        unit.status = 'IDLE';
        return;
      }

      // Move towards destination
      const moveDistance = unit.speed * deltaTime * 0.27; // Convert km/h to m/s
      const dx = unit.destination.x - unit.position.x;
      const dy = unit.destination.y - unit.position.y;
      const angle = Math.atan2(dy, dx);

      unit.position.x += Math.cos(angle) * moveDistance;
      unit.position.y += Math.sin(angle) * moveDistance;
      unit.facing = (angle * 180 / Math.PI + 90 + 360) % 360;

      // Consume fuel
      unit.fuel = Math.max(0, unit.fuel - (moveDistance * 0.001));
    });
  }

  /**
   * Process combat between units
   */
  private processCombat(): void {
    const activeUnits = this.state.units.filter(u => u.status !== 'DESTROYED');

    for (const unit of activeUnits) {
      if (unit.team !== 'FRIENDLY') continue; // Process player units first

      // Find enemies in range
      const enemies = activeUnits.filter(enemy =>
        enemy.team === 'ENEMY' &&
        this.combatEngine.canEngage(unit, enemy)
      );

      if (enemies.length > 0) {
        const target = enemies[0];
        const terrain = this.getTerrainAt(unit.position);

        // Execute combat
        const result = this.combatEngine.calculateCombat(
          unit,
          target,
          terrain.type,
          this.state.weather,
          this.state.timeOfDay
        );

        // Apply results
        this.combatEngine.applyCombatResults(unit, target, result);

        // Log combat
        this.logCombat(unit, target, result);

        // Update status
        unit.status = 'ENGAGING';
        target.status = 'ENGAGING';
      }
    }

    // Process enemy units
    for (const unit of activeUnits) {
      if (unit.team !== 'ENEMY' || unit.status === 'ENGAGING') continue;

      const enemies = activeUnits.filter(enemy =>
        enemy.team === 'FRIENDLY' &&
        this.combatEngine.canEngage(unit, enemy)
      );

      if (enemies.length > 0) {
        const target = enemies[0];
        const terrain = this.getTerrainAt(unit.position);

        const result = this.combatEngine.calculateCombat(
          unit,
          target,
          terrain.type,
          this.state.weather,
          this.state.timeOfDay
        );

        this.combatEngine.applyCombatResults(unit, target, result);
        this.logCombat(unit, target, result);

        unit.status = 'ENGAGING';
        target.status = 'ENGAGING';
      }
    }
  }

  /**
   * Update objective control
   */
  private updateObjectives(): void {
    this.state.objectives.forEach(obj => {
      const friendlyNearby = this.state.units.filter(u =>
        u.team === 'FRIENDLY' &&
        u.status !== 'DESTROYED' &&
        calculateDistance(u.position, obj.position) < obj.radius
      );

      const enemyNearby = this.state.units.filter(u =>
        u.team === 'ENEMY' &&
        u.status !== 'DESTROYED' &&
        calculateDistance(u.position, obj.position) < obj.radius
      );

      if (friendlyNearby.length > enemyNearby.length) {
        obj.controlledBy = 'FRIENDLY';
        obj.status = 'COMPLETED';
      } else if (enemyNearby.length > friendlyNearby.length) {
        obj.controlledBy = 'ENEMY';
        obj.status = 'FAILED';
      }
    });
  }

  /**
   * Get terrain at position
   */
  private getTerrainAt(pos: Position): TerrainCell {
    const cellSize = 20;
    const x = Math.floor(pos.x / cellSize);
    const y = Math.floor(pos.y / cellSize);

    if (y >= 0 && y < this.state.terrain.length &&
      x >= 0 && x < this.state.terrain[0].length) {
      return this.state.terrain[y][x];
    }

    return {
      x, y,
      type: 'OPEN',
      elevation: 0,
      coverValue: 0,
      concealmentValue: 0,
      movementModifier: 1
    };
  }

  /**
   * Log combat event
   */
  private logCombat(attacker: MilitaryUnit, defender: MilitaryUnit, result: any): void {
    this.state.combatLog.push({
      timestamp: this.state.elapsedTime,
      type: 'ENGAGEMENT',
      description: `${attacker.designation} engaged ${defender.designation} - ${result.winner} won`,
      unitId: attacker.id
    });
  }

  /**
   * Issue order to unit
   */
  issueOrder(unitId: string, order: Order): void {
    const unit = this.state.units.find(u => u.id === unitId);
    if (unit && unit.team === 'FRIENDLY') {
      unit.currentOrder = order;
      this.executeOrder(unit, order);
    }
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Pause/unpause game
   */
  setPaused(paused: boolean): void {
    this.state.isPaused = paused;
  }

  /**
   * Set game speed
   */
  setGameSpeed(speed: number): void {
    this.state.gameSpeed = speed;
  }
}
