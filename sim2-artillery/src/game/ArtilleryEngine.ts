import { Position, WeatherCondition, TimeOfDay } from '@shared/types';

// Artillery Types
export interface ArtilleryPiece {
  id: string;
  type: ArtilleryType;
  designation: string;
  position: Position;
  facing: number;
  ammunition: AmmunitionStock;
  status: ArtilleryStatus;
  crew: number;
  maxCrew: number;
  fatigue: number;
  lastFireTime: number;
}

export enum ArtilleryType {
  HOWITZER_155MM = 'HOWITZER_155MM',
  HOWITZER_105MM = 'HOWITZER_105MM',
  MORTAR_120MM = 'MORTAR_120MM',
  MORTAR_81MM = 'MORTAR_81MM',
  MLRS = 'MLRS'
}

export enum ArtilleryStatus {
  READY = 'READY',
  LOADING = 'LOADING',
  FIRING = 'FIRING',
  RELOCATING = 'RELOCATING',
  OUT_OF_AMMO = 'OUT_OF_AMMO',
  DISABLED = 'DISABLED'
}

export interface AmmunitionStock {
  HE: number;
  SMOKE: number;
  ILLUMINATION: number;
  WP: number;
}

export interface FireMission {
  id: string;
  targetPosition: Position;
  targetType: TargetType;
  ammoType: AmmoType;
  roundsOrdered: number;
  roundsFired: number;
  status: MissionStatus;
  assignedBattery: string[];
  priority: number;
  createdAt: number;
  adjustments: Adjustment[];
}

export enum TargetType {
  TROOPS_IN_OPEN = 'TROOPS_IN_OPEN',
  TROOPS_IN_COVER = 'TROOPS_IN_COVER',
  VEHICLES = 'VEHICLES',
  FORTIFICATION = 'FORTIFICATION',
  AREA_DENIAL = 'AREA_DENIAL',
  ILLUMINATION = 'ILLUMINATION',
  SMOKE_SCREEN = 'SMOKE_SCREEN'
}

export enum AmmoType {
  HE = 'HE',
  SMOKE = 'SMOKE',
  ILLUMINATION = 'ILLUMINATION',
  WP = 'WP'
}

export enum MissionStatus {
  PENDING = 'PENDING',
  ADJUSTING = 'ADJUSTING',
  FIRE_FOR_EFFECT = 'FIRE_FOR_EFFECT',
  COMPLETE = 'COMPLETE',
  CANCELLED = 'CANCELLED'
}

export interface Adjustment {
  direction: 'ADD' | 'DROP' | 'LEFT' | 'RIGHT';
  meters: number;
}

export interface BallisticData {
  muzzleVelocity: number;
  maxRange: number;
  minRange: number;
  reloadTime: number;
  blastRadius: number;
  accuracy: number;
}

export interface Impact {
  id: string;
  position: Position;
  type: AmmoType;
  radius: number;
  time: number;
  effectiveness: number;
}

export interface Target {
  id: string;
  position: Position;
  type: TargetType;
  size: number;
  priority: number;
  destroyed: boolean;
  damageLevel: number;
}

export interface ArtilleryGameState {
  batteries: ArtilleryPiece[];
  missions: FireMission[];
  targets: Target[];
  impacts: Impact[];
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  windSpeed: number;
  windDirection: number;
  gameTime: number;
  isPaused: boolean;
  gameSpeed: number;
  score: number;
  roundsFired: number;
  targetsDestroyed: number;
  selectedBattery: string | null;
  log: ArtilleryLogEntry[];
}

export interface ArtilleryLogEntry {
  time: number;
  message: string;
  type: 'fire' | 'impact' | 'mission' | 'system';
}

// Artillery specifications
const ARTILLERY_SPECS: Record<ArtilleryType, BallisticData> = {
  [ArtilleryType.HOWITZER_155MM]: {
    muzzleVelocity: 827,
    maxRange: 24000,
    minRange: 3000,
    reloadTime: 3000,
    blastRadius: 50,
    accuracy: 0.85
  },
  [ArtilleryType.HOWITZER_105MM]: {
    muzzleVelocity: 494,
    maxRange: 11500,
    minRange: 1000,
    reloadTime: 2000,
    blastRadius: 35,
    accuracy: 0.88
  },
  [ArtilleryType.MORTAR_120MM]: {
    muzzleVelocity: 325,
    maxRange: 7200,
    minRange: 500,
    reloadTime: 4000,
    blastRadius: 40,
    accuracy: 0.82
  },
  [ArtilleryType.MORTAR_81MM]: {
    muzzleVelocity: 250,
    maxRange: 5600,
    minRange: 100,
    reloadTime: 2500,
    blastRadius: 25,
    accuracy: 0.90
  },
  [ArtilleryType.MLRS]: {
    muzzleVelocity: 1000,
    maxRange: 45000,
    minRange: 10000,
    reloadTime: 30000,
    blastRadius: 200,
    accuracy: 0.70
  }
};

export class ArtilleryEngine {
  private state: ArtilleryGameState;
  private lastUpdate: number = 0;
  private missionIdCounter: number = 0;
  private impactIdCounter: number = 0;

  constructor() {
    this.state = this.initializeState();
  }

  private initializeState(): ArtilleryGameState {
    return {
      batteries: this.createBatteries(),
      missions: [],
      targets: this.createTargets(),
      impacts: [],
      weather: WeatherCondition.CLEAR,
      timeOfDay: TimeOfDay.DAY,
      windSpeed: 10,
      windDirection: 45,
      gameTime: 0,
      isPaused: false,
      gameSpeed: 1,
      score: 0,
      roundsFired: 0,
      targetsDestroyed: 0,
      selectedBattery: null,
      log: []
    };
  }

  private createBatteries(): ArtilleryPiece[] {
    return [
      {
        id: 'bat-1',
        type: ArtilleryType.HOWITZER_155MM,
        designation: 'Alpha Battery',
        position: { x: 100, y: 700 },
        facing: 0,
        ammunition: { HE: 50, SMOKE: 20, ILLUMINATION: 10, WP: 5 },
        status: ArtilleryStatus.READY,
        crew: 6,
        maxCrew: 6,
        fatigue: 0,
        lastFireTime: 0
      },
      {
        id: 'bat-2',
        type: ArtilleryType.HOWITZER_155MM,
        designation: 'Bravo Battery',
        position: { x: 200, y: 700 },
        facing: 0,
        ammunition: { HE: 50, SMOKE: 20, ILLUMINATION: 10, WP: 5 },
        status: ArtilleryStatus.READY,
        crew: 6,
        maxCrew: 6,
        fatigue: 0,
        lastFireTime: 0
      },
      {
        id: 'bat-3',
        type: ArtilleryType.MORTAR_120MM,
        designation: 'Charlie Mortars',
        position: { x: 150, y: 650 },
        facing: 0,
        ammunition: { HE: 80, SMOKE: 40, ILLUMINATION: 30, WP: 0 },
        status: ArtilleryStatus.READY,
        crew: 4,
        maxCrew: 4,
        fatigue: 0,
        lastFireTime: 0
      },
      {
        id: 'bat-4',
        type: ArtilleryType.HOWITZER_105MM,
        designation: 'Delta Battery',
        position: { x: 300, y: 700 },
        facing: 0,
        ammunition: { HE: 60, SMOKE: 25, ILLUMINATION: 15, WP: 10 },
        status: ArtilleryStatus.READY,
        crew: 5,
        maxCrew: 5,
        fatigue: 0,
        lastFireTime: 0
      }
    ];
  }

  private createTargets(): Target[] {
    return [
      { id: 't1', position: { x: 400, y: 150 }, type: TargetType.TROOPS_IN_OPEN, size: 30, priority: 2, destroyed: false, damageLevel: 0 },
      { id: 't2', position: { x: 600, y: 200 }, type: TargetType.VEHICLES, size: 40, priority: 3, destroyed: false, damageLevel: 0 },
      { id: 't3', position: { x: 800, y: 100 }, type: TargetType.FORTIFICATION, size: 50, priority: 4, destroyed: false, damageLevel: 0 },
      { id: 't4', position: { x: 500, y: 300 }, type: TargetType.TROOPS_IN_COVER, size: 35, priority: 2, destroyed: false, damageLevel: 0 },
      { id: 't5', position: { x: 700, y: 250 }, type: TargetType.VEHICLES, size: 45, priority: 3, destroyed: false, damageLevel: 0 },
      { id: 't6', position: { x: 900, y: 180 }, type: TargetType.TROOPS_IN_OPEN, size: 25, priority: 1, destroyed: false, damageLevel: 0 },
      { id: 't7', position: { x: 1000, y: 120 }, type: TargetType.FORTIFICATION, size: 60, priority: 5, destroyed: false, damageLevel: 0 },
      { id: 't8', position: { x: 550, y: 350 }, type: TargetType.TROOPS_IN_COVER, size: 30, priority: 2, destroyed: false, damageLevel: 0 }
    ];
  }

  public update(deltaTime: number): void {
    if (this.state.isPaused) return;

    const scaledDelta = deltaTime * this.state.gameSpeed;
    this.state.gameTime += scaledDelta;

    this.updateBatteries(scaledDelta);
    this.processMissions(scaledDelta);
    this.cleanupImpacts();
    this.checkVictory();
  }

  private updateBatteries(deltaTime: number): void {
    for (const battery of this.state.batteries) {
      const spec = ARTILLERY_SPECS[battery.type];

      if (battery.status === ArtilleryStatus.LOADING) {
        if (this.state.gameTime - battery.lastFireTime >= spec.reloadTime) {
          battery.status = ArtilleryStatus.READY;
        }
      }

      // Fatigue recovery
      if (battery.status === ArtilleryStatus.READY) {
        battery.fatigue = Math.max(0, battery.fatigue - deltaTime * 0.001);
      }
    }
  }

  private processMissions(deltaTime: number): void {
    for (const mission of this.state.missions) {
      if (mission.status === MissionStatus.PENDING || mission.status === MissionStatus.FIRE_FOR_EFFECT) {
        this.executeFireMission(mission);
      }
    }
  }

  private executeFireMission(mission: FireMission): void {
    for (const batteryId of mission.assignedBattery) {
      const battery = this.state.batteries.find(b => b.id === batteryId);
      if (!battery || battery.status !== ArtilleryStatus.READY) continue;

      const ammoKey = mission.ammoType as keyof AmmunitionStock;
      if (battery.ammunition[ammoKey] <= 0) {
        battery.status = ArtilleryStatus.OUT_OF_AMMO;
        continue;
      }

      // Fire!
      battery.ammunition[ammoKey]--;
      battery.status = ArtilleryStatus.LOADING;
      battery.lastFireTime = this.state.gameTime;
      battery.fatigue += 5;
      mission.roundsFired++;
      this.state.roundsFired++;

      // Calculate impact
      const impact = this.calculateImpact(battery, mission);
      this.state.impacts.push(impact);

      // Check target damage
      this.processImpactDamage(impact);

      this.addLog(`${battery.designation} fired ${mission.ammoType} at grid ${Math.floor(mission.targetPosition.x)},${Math.floor(mission.targetPosition.y)}`, 'fire');

      if (mission.roundsFired >= mission.roundsOrdered) {
        mission.status = MissionStatus.COMPLETE;
        this.addLog(`Fire mission ${mission.id} complete`, 'mission');
      }
    }
  }

  private calculateImpact(battery: ArtilleryPiece, mission: FireMission): Impact {
    const spec = ARTILLERY_SPECS[battery.type];

    // Calculate dispersion based on range and accuracy
    const distance = this.calculateDistance(battery.position, mission.targetPosition);
    const dispersion = (distance / spec.maxRange) * (1 - spec.accuracy) * 100;

    // Apply wind effect
    const windEffect = this.state.windSpeed * 0.5;
    const windOffsetX = Math.cos(this.state.windDirection * Math.PI / 180) * windEffect;
    const windOffsetY = Math.sin(this.state.windDirection * Math.PI / 180) * windEffect;

    // Apply adjustments
    let adjustedX = mission.targetPosition.x;
    let adjustedY = mission.targetPosition.y;
    for (const adj of mission.adjustments) {
      switch (adj.direction) {
        case 'ADD': adjustedY -= adj.meters / 10; break;
        case 'DROP': adjustedY += adj.meters / 10; break;
        case 'LEFT': adjustedX -= adj.meters / 10; break;
        case 'RIGHT': adjustedX += adj.meters / 10; break;
      }
    }

    // Calculate final impact point with dispersion
    const impactX = adjustedX + (Math.random() - 0.5) * dispersion + windOffsetX;
    const impactY = adjustedY + (Math.random() - 0.5) * dispersion + windOffsetY;

    return {
      id: `impact-${++this.impactIdCounter}`,
      position: { x: impactX, y: impactY },
      type: mission.ammoType,
      radius: spec.blastRadius,
      time: this.state.gameTime,
      effectiveness: this.calculateEffectiveness(mission.ammoType, mission.targetType)
    };
  }

  private calculateEffectiveness(ammo: AmmoType, target: TargetType): number {
    const matrix: Record<AmmoType, Record<TargetType, number>> = {
      [AmmoType.HE]: {
        [TargetType.TROOPS_IN_OPEN]: 1.0,
        [TargetType.TROOPS_IN_COVER]: 0.5,
        [TargetType.VEHICLES]: 0.7,
        [TargetType.FORTIFICATION]: 0.3,
        [TargetType.AREA_DENIAL]: 0.8,
        [TargetType.ILLUMINATION]: 0,
        [TargetType.SMOKE_SCREEN]: 0
      },
      [AmmoType.SMOKE]: {
        [TargetType.TROOPS_IN_OPEN]: 0,
        [TargetType.TROOPS_IN_COVER]: 0,
        [TargetType.VEHICLES]: 0,
        [TargetType.FORTIFICATION]: 0,
        [TargetType.AREA_DENIAL]: 0,
        [TargetType.ILLUMINATION]: 0,
        [TargetType.SMOKE_SCREEN]: 1.0
      },
      [AmmoType.ILLUMINATION]: {
        [TargetType.TROOPS_IN_OPEN]: 0,
        [TargetType.TROOPS_IN_COVER]: 0,
        [TargetType.VEHICLES]: 0,
        [TargetType.FORTIFICATION]: 0,
        [TargetType.AREA_DENIAL]: 0,
        [TargetType.ILLUMINATION]: 1.0,
        [TargetType.SMOKE_SCREEN]: 0
      },
      [AmmoType.WP]: {
        [TargetType.TROOPS_IN_OPEN]: 1.2,
        [TargetType.TROOPS_IN_COVER]: 0.8,
        [TargetType.VEHICLES]: 0.6,
        [TargetType.FORTIFICATION]: 0.4,
        [TargetType.AREA_DENIAL]: 1.0,
        [TargetType.ILLUMINATION]: 0,
        [TargetType.SMOKE_SCREEN]: 0.5
      }
    };
    return matrix[ammo][target] || 0;
  }

  private processImpactDamage(impact: Impact): void {
    for (const target of this.state.targets) {
      if (target.destroyed) continue;

      const distance = this.calculateDistance(impact.position, target.position);
      if (distance <= impact.radius + target.size) {
        const damage = impact.effectiveness * (1 - distance / (impact.radius + target.size)) * 50;
        target.damageLevel += damage;

        if (target.damageLevel >= 100) {
          target.destroyed = true;
          this.state.targetsDestroyed++;
          this.state.score += target.priority * 100;
          this.addLog(`Target ${target.id} destroyed! +${target.priority * 100} points`, 'impact');
        }
      }
    }
  }

  private cleanupImpacts(): void {
    this.state.impacts = this.state.impacts.filter(
      i => this.state.gameTime - i.time < 3000
    );
  }

  private checkVictory(): void {
    const allDestroyed = this.state.targets.every(t => t.destroyed);
    if (allDestroyed) {
      this.addLog('All targets destroyed! Mission complete!', 'system');
      this.state.isPaused = true;
    }
  }

  private calculateDistance(a: Position, b: Position): number {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  private addLog(message: string, type: ArtilleryLogEntry['type']): void {
    this.state.log.push({
      time: this.state.gameTime,
      message,
      type
    });
    if (this.state.log.length > 100) {
      this.state.log.shift();
    }
  }

  // Public methods
  public createFireMission(
    targetPosition: Position,
    targetType: TargetType,
    ammoType: AmmoType,
    rounds: number,
    batteryIds: string[]
  ): FireMission {
    const mission: FireMission = {
      id: `FM-${++this.missionIdCounter}`,
      targetPosition,
      targetType,
      ammoType,
      roundsOrdered: rounds,
      roundsFired: 0,
      status: MissionStatus.PENDING,
      assignedBattery: batteryIds,
      priority: 1,
      createdAt: this.state.gameTime,
      adjustments: []
    };
    this.state.missions.push(mission);
    this.addLog(`Fire mission ${mission.id} created`, 'mission');
    return mission;
  }

  public adjustFire(missionId: string, adjustment: Adjustment): void {
    const mission = this.state.missions.find(m => m.id === missionId);
    if (mission) {
      mission.adjustments.push(adjustment);
      mission.status = MissionStatus.ADJUSTING;
      this.addLog(`Adjustment: ${adjustment.direction} ${adjustment.meters}m`, 'mission');
    }
  }

  public fireForEffect(missionId: string): void {
    const mission = this.state.missions.find(m => m.id === missionId);
    if (mission) {
      mission.status = MissionStatus.FIRE_FOR_EFFECT;
      this.addLog(`Fire for effect! Mission ${missionId}`, 'mission');
    }
  }

  public cancelMission(missionId: string): void {
    const mission = this.state.missions.find(m => m.id === missionId);
    if (mission) {
      mission.status = MissionStatus.CANCELLED;
      this.addLog(`Mission ${missionId} cancelled`, 'mission');
    }
  }

  public selectBattery(batteryId: string | null): void {
    this.state.selectedBattery = batteryId;
  }

  public setGameSpeed(speed: number): void {
    this.state.gameSpeed = speed;
  }

  public togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
  }

  public getState(): ArtilleryGameState {
    return this.state;
  }

  public getArtillerySpecs(): Record<ArtilleryType, BallisticData> {
    return ARTILLERY_SPECS;
  }
}
