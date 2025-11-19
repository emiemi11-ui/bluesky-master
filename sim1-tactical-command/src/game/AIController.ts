/**
 * Tactical AI Controller - Adaptive enemy AI
 */

import {
  MilitaryUnit,
  CommandType,
  Order,
  Position,
  Objective
} from '@shared/types';
import { calculateDistance } from '@shared/utils/calculations';

interface GameState {
  units: MilitaryUnit[];
  objectives: Objective[];
  elapsedTime: number;
}

interface TacticalAssessment {
  forceRatio: number;
  objectivesHeld: number;
  objectivesTotal: number;
  avgAmmo: number;
  avgFuel: number;
  avgMorale: number;
  enemyFlankExposed: boolean;
  enemyIsolatedUnit: MilitaryUnit | null;
  confidence: number;
}

interface Strategy {
  type: StrategyType;
  description: string;
}

type StrategyType =
  | 'AGGRESSIVE_ASSAULT'
  | 'FLANKING_MANEUVER'
  | 'METHODICAL_ATTACK'
  | 'DEFENSIVE_POSTURE'
  | 'FOCUS_FIRE'
  | 'TACTICAL_RETREAT'
  | 'HOLD_GROUND'
  | 'AMBUSH';

export class TacticalAI {

  private memory: Map<string, any> = new Map();
  private difficulty: 'EASY' | 'MEDIUM' | 'HARD';

  constructor(difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM') {
    this.difficulty = difficulty;
  }

  /**
   * Main decision-making function
   */
  makeDecision(gameState: GameState): Order[] {

    // Assess current situation
    const assessment = this.assessSituation(gameState);

    // Learn from player behavior (only on HARD difficulty)
    if (this.difficulty === 'HARD') {
      this.learnPlayerBehavior(gameState);
    }

    // Select strategy based on assessment
    const strategy = this.selectStrategy(assessment);

    // Generate orders based on strategy
    const orders = this.generateOrders(strategy, gameState, assessment);

    return orders;
  }

  /**
   * Assess the tactical situation
   */
  private assessSituation(gameState: GameState): TacticalAssessment {

    const myUnits = gameState.units.filter(u => u.team === 'ENEMY');
    const enemyUnits = gameState.units.filter(u => u.team === 'FRIENDLY');

    // Calculate force ratio
    const myStrength = myUnits.reduce((sum, u) => sum + u.count * u.firepower, 0);
    const enemyStrength = enemyUnits.reduce((sum, u) => sum + u.count * u.firepower, 0);
    const forceRatio = myStrength / (enemyStrength + 1);

    // Count objectives held
    const objectivesHeld = gameState.objectives.filter(
      obj => obj.controlledBy === 'ENEMY'
    ).length;
    const objectivesTotal = gameState.objectives.length;

    // Assess logistics
    const avgAmmo = myUnits.reduce((sum, u) => sum + u.ammunition, 0) / myUnits.length;
    const avgFuel = myUnits.reduce((sum, u) => sum + u.fuel, 0) / myUnits.length;
    const avgMorale = myUnits.reduce((sum, u) => sum + u.morale, 0) / myUnits.length;

    // Check for tactical opportunities
    const enemyFlankExposed = this.checkForExposedFlank(enemyUnits);
    const enemyIsolatedUnit = this.findIsolatedUnit(enemyUnits);

    // Calculate confidence
    const confidence = this.calculateConfidence(forceRatio, avgAmmo, avgMorale);

    return {
      forceRatio,
      objectivesHeld,
      objectivesTotal,
      avgAmmo,
      avgFuel,
      avgMorale,
      enemyFlankExposed,
      enemyIsolatedUnit,
      confidence
    };
  }

  /**
   * Select strategy based on tactical assessment
   */
  private selectStrategy(assessment: TacticalAssessment): Strategy {

    // Overwhelming superiority = aggressive attack
    if (assessment.forceRatio > 2.0 && assessment.avgAmmo > 60) {
      return {
        type: 'AGGRESSIVE_ASSAULT',
        description: 'Overwhelming force - full assault on all fronts'
      };
    }

    // Superiority + exposed flank = flanking maneuver
    if (assessment.forceRatio > 1.3 && assessment.enemyFlankExposed) {
      return {
        type: 'FLANKING_MANEUVER',
        description: 'Enemy flank exposed - execute double envelopment'
      };
    }

    // Slight advantage = methodical attack
    if (assessment.forceRatio > 1.0 && assessment.forceRatio < 1.5) {
      return {
        type: 'METHODICAL_ATTACK',
        description: 'Gradual advance with fire support'
      };
    }

    // Equal forces = defensive posture
    if (assessment.forceRatio >= 0.8 && assessment.forceRatio <= 1.2) {
      return {
        type: 'DEFENSIVE_POSTURE',
        description: 'Hold ground and wait for opportunity'
      };
    }

    // Inferior + isolated enemy = focus fire
    if (assessment.forceRatio < 0.8 && assessment.enemyIsolatedUnit) {
      return {
        type: 'FOCUS_FIRE',
        description: 'Concentrate fire on isolated enemy units'
      };
    }

    // Weak + low supplies = retreat
    if (assessment.forceRatio < 0.6 || assessment.avgAmmo < 30 || assessment.avgMorale < 40) {
      return {
        type: 'TACTICAL_RETREAT',
        description: 'Withdraw and regroup'
      };
    }

    // Default
    return {
      type: 'HOLD_GROUND',
      description: 'Maintain current positions'
    };
  }

  /**
   * Generate orders based on strategy
   */
  private generateOrders(
    strategy: Strategy,
    gameState: GameState,
    assessment: TacticalAssessment
  ): Order[] {

    const orders: Order[] = [];
    const myUnits = gameState.units.filter(u => u.team === 'ENEMY');
    const enemyUnits = gameState.units.filter(u => u.team === 'FRIENDLY');

    switch (strategy.type) {

      case 'AGGRESSIVE_ASSAULT':
        // All units attack nearest enemy or objective
        myUnits.forEach(unit => {
          if (unit.status === 'DESTROYED') return;

          const target = this.findNearestTarget(unit, enemyUnits, gameState.objectives);
          orders.push({
            id: `order-${Date.now()}-${unit.id}`,
            unitId: unit.id,
            type: CommandType.ATTACK,
            target: target,
            priority: 1,
            status: 'PENDING',
            issuedAt: Date.now()
          });
        });
        break;

      case 'FLANKING_MANEUVER':
        // Split forces - 60% frontal, 40% flank
        const splitIndex = Math.floor(myUnits.length * 0.6);
        const frontalUnits = myUnits.slice(0, splitIndex);
        const flankingUnits = myUnits.slice(splitIndex);

        // Frontal units attack center
        const enemyCenter = this.findEnemyCenter(enemyUnits);
        frontalUnits.forEach(unit => {
          if (unit.status === 'DESTROYED') return;
          orders.push({
            id: `order-${Date.now()}-${unit.id}`,
            unitId: unit.id,
            type: CommandType.ATTACK,
            target: enemyCenter,
            priority: 2,
            status: 'PENDING',
            issuedAt: Date.now()
          });
        });

        // Flanking units go around
        const flankPosition = this.findFlankPosition(enemyUnits);
        flankingUnits.forEach(unit => {
          if (unit.status === 'DESTROYED') return;
          orders.push({
            id: `order-${Date.now()}-${unit.id}`,
            unitId: unit.id,
            type: CommandType.FLANK,
            target: flankPosition,
            priority: 1,
            status: 'PENDING',
            issuedAt: Date.now()
          });
        });
        break;

      case 'DEFENSIVE_POSTURE':
        // Take defensive positions
        myUnits.forEach(unit => {
          if (unit.status === 'DESTROYED') return;

          const defensivePos = this.findDefensivePosition(unit, gameState);
          orders.push({
            id: `order-${Date.now()}-${unit.id}`,
            unitId: unit.id,
            type: CommandType.DEFEND,
            target: defensivePos,
            priority: 3,
            status: 'PENDING',
            issuedAt: Date.now()
          });
        });
        break;

      case 'TACTICAL_RETREAT':
        // Fall back to rally point
        const rallyPoint = this.findRallyPoint(gameState);
        myUnits.forEach(unit => {
          if (unit.status === 'DESTROYED') return;
          orders.push({
            id: `order-${Date.now()}-${unit.id}`,
            unitId: unit.id,
            type: CommandType.RETREAT,
            target: rallyPoint,
            priority: 1,
            status: 'PENDING',
            issuedAt: Date.now()
          });
        });
        break;

      case 'FOCUS_FIRE':
        // All units target isolated enemy
        if (assessment.enemyIsolatedUnit) {
          myUnits.forEach(unit => {
            if (unit.status === 'DESTROYED') return;
            orders.push({
              id: `order-${Date.now()}-${unit.id}`,
              unitId: unit.id,
              type: CommandType.ATTACK,
              target: assessment.enemyIsolatedUnit!.position,
              priority: 1,
              status: 'PENDING',
              issuedAt: Date.now()
            });
          });
        }
        break;

      case 'HOLD_GROUND':
      default:
        // Hold current positions
        myUnits.forEach(unit => {
          if (unit.status === 'DESTROYED') return;
          orders.push({
            id: `order-${Date.now()}-${unit.id}`,
            unitId: unit.id,
            type: CommandType.HOLD,
            priority: 4,
            status: 'PENDING',
            issuedAt: Date.now()
          });
        });
        break;
    }

    return orders;
  }

  /**
   * Learn from player behavior (adaptive AI)
   */
  private learnPlayerBehavior(gameState: GameState): void {
    const playerUnits = gameState.units.filter(u => u.team === 'FRIENDLY');

    if (playerUnits.length === 0) return;

    // Track player's average position
    const avgPlayerX = playerUnits.reduce((sum, u) => sum + u.position.x, 0) / playerUnits.length;
    const avgPlayerY = playerUnits.reduce((sum, u) => sum + u.position.y, 0) / playerUnits.length;

    // Check if player favors left or right side
    const leftBias = this.memory.get('player_left_count') || 0;
    const rightBias = this.memory.get('player_right_count') || 0;

    if (avgPlayerX < 600) {
      this.memory.set('player_left_count', leftBias + 1);
    } else {
      this.memory.set('player_right_count', rightBias + 1);
    }

    // Track player's aggressive vs defensive tendency
    const playerInCombat = playerUnits.filter(u => u.status === 'ENGAGING').length;
    const aggressionScore = playerInCombat / playerUnits.length;
    this.memory.set('player_aggression', aggressionScore);
  }

  // Helper methods

  private checkForExposedFlank(units: MilitaryUnit[]): boolean {
    if (units.length < 3) return false;

    // Calculate spread of units
    const xPositions = units.map(u => u.position.x);
    const spread = Math.max(...xPositions) - Math.min(...xPositions);

    // If units are spread out > 400m, flank is exposed
    return spread > 400;
  }

  private findIsolatedUnit(units: MilitaryUnit[]): MilitaryUnit | null {
    for (const unit of units) {
      const nearbyAllies = units.filter(u =>
        u.id !== unit.id &&
        calculateDistance(u.position, unit.position) < 200
      );

      // Isolated if no allies within 200m
      if (nearbyAllies.length === 0) {
        return unit;
      }
    }
    return null;
  }

  private findNearestTarget(
    unit: MilitaryUnit,
    enemies: MilitaryUnit[],
    objectives: Objective[]
  ): Position {
    let nearestDist = Infinity;
    let nearestPos: Position = unit.position;

    // Check enemy units
    for (const enemy of enemies) {
      if (enemy.status === 'DESTROYED') continue;
      const dist = calculateDistance(unit.position, enemy.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestPos = enemy.position;
      }
    }

    // Check objectives
    for (const obj of objectives) {
      if (obj.controlledBy === 'ENEMY') continue;
      const dist = calculateDistance(unit.position, obj.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestPos = obj.position;
      }
    }

    return nearestPos;
  }

  private findEnemyCenter(enemies: MilitaryUnit[]): Position {
    if (enemies.length === 0) return { x: 600, y: 400 };

    const avgX = enemies.reduce((sum, u) => sum + u.position.x, 0) / enemies.length;
    const avgY = enemies.reduce((sum, u) => sum + u.position.y, 0) / enemies.length;

    return { x: avgX, y: avgY };
  }

  private findFlankPosition(enemies: MilitaryUnit[]): Position {
    const center = this.findEnemyCenter(enemies);
    // Flank position is 300m to the side
    return {
      x: center.x + 300,
      y: center.y
    };
  }

  private findDefensivePosition(unit: MilitaryUnit, gameState: GameState): Position {
    // Find nearest objective to defend
    let nearestObj = gameState.objectives[0];
    let nearestDist = Infinity;

    for (const obj of gameState.objectives) {
      const dist = calculateDistance(unit.position, obj.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestObj = obj;
      }
    }

    return nearestObj.position;
  }

  private findRallyPoint(gameState: GameState): Position {
    // Rally point is behind friendly lines
    const myUnits = gameState.units.filter(u => u.team === 'ENEMY');
    if (myUnits.length === 0) return { x: 100, y: 400 };

    const avgX = myUnits.reduce((sum, u) => sum + u.position.x, 0) / myUnits.length;

    // Rally 200m back
    return {
      x: Math.max(50, avgX - 200),
      y: 400
    };
  }

  private calculateConfidence(
    forceRatio: number,
    ammo: number,
    morale: number
  ): number {
    return Math.min(100,
      forceRatio * 30 +
      ammo * 0.3 +
      morale * 0.4
    );
  }
}
