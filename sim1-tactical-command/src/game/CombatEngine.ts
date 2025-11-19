/**
 * Combat Engine - Realistic military combat simulation
 */

import {
  MilitaryUnit,
  CombatResult,
  TerrainType,
  WeatherCondition,
  TimeOfDay,
  TERRAIN_MODIFIERS,
  WEATHER_EFFECTS,
  TIME_EFFECTS,
  Position
} from '@shared/types';
import { calculateDistance } from '@shared/utils/calculations';

export class CombatEngine {

  /**
   * Main combat resolution function
   */
  calculateCombat(
    attacker: MilitaryUnit,
    defender: MilitaryUnit,
    terrain: TerrainType,
    weather: WeatherCondition,
    timeOfDay: TimeOfDay
  ): CombatResult {

    // Calculate base combat power
    let attackPower = this.calculateAttackPower(attacker);
    let defensePower = this.calculateDefensePower(defender);

    // Apply terrain modifiers
    const terrainMod = TERRAIN_MODIFIERS[terrain];
    attackPower *= terrainMod.attack;
    defensePower *= terrainMod.defense;

    // Apply weather modifiers
    const weatherMod = WEATHER_EFFECTS[weather];
    attackPower *= weatherMod.combatMultiplier;

    // Apply time of day modifiers
    const timeMod = TIME_EFFECTS[timeOfDay];
    attackPower *= timeMod.visibilityMultiplier;

    // Apply morale modifiers
    attackPower *= (attacker.morale / 100);
    defensePower *= (defender.morale / 100);

    // Check for elevation advantage
    if (defender.position.elevation && attacker.position.elevation) {
      if (defender.position.elevation > attacker.position.elevation + 10) {
        defensePower *= 1.3; // Defender has high ground
      }
    }

    // Check for flanking
    const isFlankAttack = this.checkFlankingAttack(attacker, defender);
    if (isFlankAttack) {
      attackPower *= 1.4; // Flanking bonus
      defensePower *= 0.7; // Defender caught in flank
    }

    // Calculate casualties
    const attackerLosses = this.calculateLosses(
      defensePower,
      attacker.count,
      attacker.armor
    );

    const defenderLosses = this.calculateLosses(
      attackPower,
      defender.count,
      defender.armor
    );

    // Determine winner
    const winner = this.determineWinner(
      attackPower,
      defensePower,
      attackerLosses,
      defenderLosses
    );

    // Calculate morale damage
    const moraleDamage = this.calculateMoraleDamage(
      winner,
      attackerLosses,
      defenderLosses,
      attacker,
      defender
    );

    // Calculate ammunition used (5% per engagement)
    const ammunitionUsed = Math.floor(attacker.count * 0.05);

    // Calculate casualty ratio
    const casualtyRatio = defenderLosses / (attackerLosses + 1);

    return {
      attackerLosses,
      defenderLosses,
      winner,
      moraleDamage,
      ammunitionUsed,
      duration: 60, // 1 minute engagement
      casualtyRatio
    };
  }

  /**
   * Calculate attack power
   */
  private calculateAttackPower(unit: MilitaryUnit): number {
    return unit.firepower * unit.count * (unit.ammunition / 100);
  }

  /**
   * Calculate defense power
   */
  private calculateDefensePower(unit: MilitaryUnit): number {
    return unit.armor * unit.count;
  }

  /**
   * Calculate losses based on enemy power
   */
  private calculateLosses(
    enemyPower: number,
    unitCount: number,
    armor: number
  ): number {
    // Base casualty rate
    const baseRate = enemyPower / (armor * 100);

    // Random factor (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;

    // Calculate actual losses
    const losses = Math.floor(unitCount * baseRate * randomFactor);

    // Cap at unit count
    return Math.min(losses, unitCount);
  }

  /**
   * Determine combat winner
   */
  private determineWinner(
    attackPower: number,
    defensePower: number,
    attackerLosses: number,
    defenderLosses: number
  ): 'ATTACKER' | 'DEFENDER' | 'DRAW' {

    const powerRatio = attackPower / (defensePower + 1);
    const lossRatio = defenderLosses / (attackerLosses + 1);

    // Combined metric
    const score = powerRatio * lossRatio;

    if (score > 1.5) return 'ATTACKER';
    if (score < 0.7) return 'DEFENDER';
    return 'DRAW';
  }

  /**
   * Calculate morale damage from combat
   */
  private calculateMoraleDamage(
    winner: 'ATTACKER' | 'DEFENDER' | 'DRAW',
    attackerLosses: number,
    defenderLosses: number,
    attacker: MilitaryUnit,
    defender: MilitaryUnit
  ): number {

    let damage = 10; // Base morale damage

    // Winner takes less morale damage
    if (winner === 'ATTACKER') {
      damage += attackerLosses * 0.5;
    } else if (winner === 'DEFENDER') {
      damage += defenderLosses * 0.5;
    } else {
      damage += 15; // Draws are demoralizing
    }

    // Heavy casualties = more morale damage
    const attackerCasualtyRate = attackerLosses / attacker.maxCount;
    const defenderCasualtyRate = defenderLosses / defender.maxCount;

    if (attackerCasualtyRate > 0.25) damage += 15;
    if (defenderCasualtyRate > 0.25) damage += 15;

    return Math.min(damage, 40); // Max 40 morale loss per engagement
  }

  /**
   * Check if attack is a flanking attack
   */
  private checkFlankingAttack(
    attacker: MilitaryUnit,
    defender: MilitaryUnit
  ): boolean {
    // Calculate angle between defender's facing and attacker's direction
    const dx = attacker.position.x - defender.position.x;
    const dy = attacker.position.y - defender.position.y;
    const attackAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Normalize to 0-360
    const normalizedAttackAngle = (attackAngle + 360) % 360;
    const facingAngle = defender.facing;

    // Calculate difference
    let diff = Math.abs(normalizedAttackAngle - facingAngle);
    if (diff > 180) diff = 360 - diff;

    // Flank if attack comes from >90 degrees off facing
    return diff > 90;
  }

  /**
   * Apply combat results to units
   */
  applyCombatResults(
    attacker: MilitaryUnit,
    defender: MilitaryUnit,
    result: CombatResult
  ): void {
    // Apply losses
    attacker.count = Math.max(0, attacker.count - result.attackerLosses);
    defender.count = Math.max(0, defender.count - result.defenderLosses);

    // Apply morale damage
    if (result.winner === 'ATTACKER') {
      attacker.morale = Math.max(0, attacker.morale - result.moraleDamage * 0.5);
      defender.morale = Math.max(0, defender.morale - result.moraleDamage);
    } else if (result.winner === 'DEFENDER') {
      attacker.morale = Math.max(0, attacker.morale - result.moraleDamage);
      defender.morale = Math.max(0, defender.morale - result.moraleDamage * 0.5);
    } else {
      attacker.morale = Math.max(0, attacker.morale - result.moraleDamage);
      defender.morale = Math.max(0, defender.morale - result.moraleDamage);
    }

    // Apply ammunition consumption
    attacker.ammunition = Math.max(0, attacker.ammunition - result.ammunitionUsed);

    // Update status
    if (attacker.count === 0) {
      attacker.status = 'DESTROYED';
    } else if (attacker.morale < 30) {
      attacker.status = 'RETREATING';
    }

    if (defender.count === 0) {
      defender.status = 'DESTROYED';
    } else if (defender.morale < 30) {
      defender.status = 'RETREATING';
    } else if (defender.morale < 50) {
      defender.status = 'PINNED';
    }
  }

  /**
   * Check if units can engage
   */
  canEngage(unit1: MilitaryUnit, unit2: MilitaryUnit): boolean {
    // Check if both units are active
    if (unit1.status === 'DESTROYED' || unit2.status === 'DESTROYED') {
      return false;
    }

    // Check range
    const distance = calculateDistance(unit1.position, unit2.position);
    if (distance > unit1.weaponRange) {
      return false;
    }

    // Check ammunition
    if (unit1.ammunition <= 0) {
      return false;
    }

    // Check if same team
    if (unit1.team === unit2.team) {
      return false;
    }

    return true;
  }

  /**
   * Calculate suppression effect
   * Suppression reduces unit effectiveness without causing casualties
   */
  calculateSuppression(
    attacker: MilitaryUnit,
    defender: MilitaryUnit
  ): number {
    const suppressionPower = attacker.firepower * (attacker.count / defender.count);
    return Math.min(50, suppressionPower * 5); // Max 50% effectiveness reduction
  }
}
