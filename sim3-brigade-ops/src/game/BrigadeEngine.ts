import { Position, WeatherCondition, TimeOfDay, UnitType, CommandType } from '@shared/types';

// Brigade Operations Types
export interface Company {
  id: string;
  designation: string;
  type: CompanyType;
  battalionId: string;
  position: Position;
  destination: Position | null;
  strength: number;
  maxStrength: number;
  morale: number;
  ammunition: number;
  fuel: number;
  status: CompanyStatus;
  combatEffectiveness: number;
  isVisible: boolean;
  lastContact: number;
  orders: CompanyOrder[];
}

export enum CompanyType {
  INFANTRY = 'INFANTRY',
  ARMOR = 'ARMOR',
  MECHANIZED = 'MECHANIZED',
  RECON = 'RECON',
  ENGINEER = 'ENGINEER',
  ARTILLERY = 'ARTILLERY',
  LOGISTICS = 'LOGISTICS',
  HQ = 'HQ'
}

export enum CompanyStatus {
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  ATTACKING = 'ATTACKING',
  DEFENDING = 'DEFENDING',
  RETREATING = 'RETREATING',
  RESUPPLYING = 'RESUPPLYING',
  DESTROYED = 'DESTROYED',
  OUT_OF_CONTACT = 'OUT_OF_CONTACT'
}

export interface CompanyOrder {
  id: string;
  type: CommandType;
  target: Position | string;
  priority: number;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETE';
}

export interface Battalion {
  id: string;
  designation: string;
  companies: string[];
  hqPosition: Position;
  commandRadius: number;
}

export interface SupplyDepot {
  id: string;
  position: Position;
  ammunition: number;
  fuel: number;
  supplies: number;
  isActive: boolean;
}

export interface SupplyRoute {
  id: string;
  from: string;
  to: string;
  isSecure: boolean;
  efficiency: number;
}

export interface Objective {
  id: string;
  name: string;
  position: Position;
  radius: number;
  points: number;
  controlledBy: 'FRIENDLY' | 'ENEMY' | 'NEUTRAL';
  captureProgress: number;
}

export interface IntelReport {
  id: string;
  position: Position;
  type: 'ENEMY_UNIT' | 'ENEMY_MOVEMENT' | 'ENEMY_POSITION';
  confidence: number;
  timestamp: number;
  description: string;
}

export interface BrigadeGameState {
  // Forces
  friendlyCompanies: Company[];
  enemyCompanies: Company[];
  battalions: Battalion[];

  // Logistics
  supplyDepots: SupplyDepot[];
  supplyRoutes: SupplyRoute[];

  // Objectives
  objectives: Objective[];

  // Intel & Fog of War
  intelReports: IntelReport[];
  visibilityMap: boolean[][];

  // Environment
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;

  // Game State
  gameTime: number;
  isPaused: boolean;
  gameSpeed: number;
  selectedCompany: string | null;

  // Metrics
  score: number;
  casualties: number;
  enemyCasualties: number;
  objectivesHeld: number;
  supplyStatus: number;

  // Log
  log: BrigadeLogEntry[];
}

export interface BrigadeLogEntry {
  time: number;
  message: string;
  type: 'combat' | 'movement' | 'supply' | 'intel' | 'objective' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Company specifications
const COMPANY_SPECS: Record<CompanyType, { speed: number; firepower: number; armor: number; viewRange: number }> = {
  [CompanyType.INFANTRY]: { speed: 5, firepower: 60, armor: 20, viewRange: 100 },
  [CompanyType.ARMOR]: { speed: 40, firepower: 100, armor: 80, viewRange: 150 },
  [CompanyType.MECHANIZED]: { speed: 30, firepower: 80, armor: 50, viewRange: 120 },
  [CompanyType.RECON]: { speed: 50, firepower: 30, armor: 15, viewRange: 250 },
  [CompanyType.ENGINEER]: { speed: 10, firepower: 40, armor: 25, viewRange: 80 },
  [CompanyType.ARTILLERY]: { speed: 15, firepower: 120, armor: 10, viewRange: 60 },
  [CompanyType.LOGISTICS]: { speed: 25, firepower: 10, armor: 5, viewRange: 50 },
  [CompanyType.HQ]: { speed: 20, firepower: 20, armor: 30, viewRange: 100 }
};

export class BrigadeEngine {
  private state: BrigadeGameState;
  private orderIdCounter: number = 0;

  constructor() {
    this.state = this.initializeState();
  }

  private initializeState(): BrigadeGameState {
    return {
      friendlyCompanies: this.createFriendlyForces(),
      enemyCompanies: this.createEnemyForces(),
      battalions: this.createBattalions(),
      supplyDepots: this.createSupplyDepots(),
      supplyRoutes: [],
      objectives: this.createObjectives(),
      intelReports: [],
      visibilityMap: this.createVisibilityMap(),
      weather: WeatherCondition.CLEAR,
      timeOfDay: TimeOfDay.DAY,
      gameTime: 0,
      isPaused: false,
      gameSpeed: 1,
      selectedCompany: null,
      score: 0,
      casualties: 0,
      enemyCasualties: 0,
      objectivesHeld: 0,
      supplyStatus: 100,
      log: []
    };
  }

  private createFriendlyForces(): Company[] {
    const companies: Company[] = [];

    // 1st Battalion - Infantry
    companies.push(
      this.createCompany('A-1-1', 'Alpha Company', CompanyType.INFANTRY, 'bn-1', { x: 150, y: 600 }),
      this.createCompany('B-1-1', 'Bravo Company', CompanyType.INFANTRY, 'bn-1', { x: 200, y: 650 }),
      this.createCompany('C-1-1', 'Charlie Company', CompanyType.MECHANIZED, 'bn-1', { x: 250, y: 600 }),
      this.createCompany('HQ-1', 'HQ Company', CompanyType.HQ, 'bn-1', { x: 100, y: 700 })
    );

    // 2nd Battalion - Armor
    companies.push(
      this.createCompany('A-2-1', 'Alpha Armor', CompanyType.ARMOR, 'bn-2', { x: 350, y: 650 }),
      this.createCompany('B-2-1', 'Bravo Armor', CompanyType.ARMOR, 'bn-2', { x: 400, y: 700 }),
      this.createCompany('C-2-1', 'Charlie Mech', CompanyType.MECHANIZED, 'bn-2', { x: 450, y: 650 })
    );

    // Support Units
    companies.push(
      this.createCompany('REC-1', 'Recon Platoon', CompanyType.RECON, 'bn-1', { x: 300, y: 550 }),
      this.createCompany('ART-1', 'Artillery Battery', CompanyType.ARTILLERY, 'bn-1', { x: 100, y: 750 }),
      this.createCompany('LOG-1', 'Logistics Company', CompanyType.LOGISTICS, 'bn-1', { x: 50, y: 700 }),
      this.createCompany('ENG-1', 'Engineer Company', CompanyType.ENGINEER, 'bn-1', { x: 200, y: 700 })
    );

    return companies;
  }

  private createEnemyForces(): Company[] {
    const companies: Company[] = [];

    companies.push(
      this.createCompany('E-1', 'Enemy Infantry 1', CompanyType.INFANTRY, 'e-bn', { x: 900, y: 200 }, false),
      this.createCompany('E-2', 'Enemy Infantry 2', CompanyType.INFANTRY, 'e-bn', { x: 1000, y: 250 }, false),
      this.createCompany('E-3', 'Enemy Armor', CompanyType.ARMOR, 'e-bn', { x: 950, y: 150 }, false),
      this.createCompany('E-4', 'Enemy Mech', CompanyType.MECHANIZED, 'e-bn', { x: 850, y: 300 }, false),
      this.createCompany('E-5', 'Enemy Infantry 3', CompanyType.INFANTRY, 'e-bn', { x: 1100, y: 200 }, false),
      this.createCompany('E-6', 'Enemy Artillery', CompanyType.ARTILLERY, 'e-bn', { x: 1150, y: 100 }, false)
    );

    return companies;
  }

  private createCompany(id: string, designation: string, type: CompanyType, battalionId: string, position: Position, visible: boolean = true): Company {
    return {
      id,
      designation,
      type,
      battalionId,
      position,
      destination: null,
      strength: 100,
      maxStrength: 100,
      morale: 85,
      ammunition: 100,
      fuel: 100,
      status: CompanyStatus.IDLE,
      combatEffectiveness: 100,
      isVisible: visible,
      lastContact: 0,
      orders: []
    };
  }

  private createBattalions(): Battalion[] {
    return [
      {
        id: 'bn-1',
        designation: '1st Infantry Battalion',
        companies: ['A-1-1', 'B-1-1', 'C-1-1', 'HQ-1'],
        hqPosition: { x: 100, y: 700 },
        commandRadius: 300
      },
      {
        id: 'bn-2',
        designation: '2nd Armor Battalion',
        companies: ['A-2-1', 'B-2-1', 'C-2-1'],
        hqPosition: { x: 400, y: 700 },
        commandRadius: 350
      }
    ];
  }

  private createSupplyDepots(): SupplyDepot[] {
    return [
      { id: 'depot-1', position: { x: 50, y: 750 }, ammunition: 1000, fuel: 2000, supplies: 500, isActive: true },
      { id: 'depot-2', position: { x: 300, y: 700 }, ammunition: 500, fuel: 1000, supplies: 300, isActive: true }
    ];
  }

  private createObjectives(): Objective[] {
    return [
      { id: 'obj-1', name: 'Hill 205', position: { x: 500, y: 300 }, radius: 60, points: 100, controlledBy: 'NEUTRAL', captureProgress: 0 },
      { id: 'obj-2', name: 'Crossroads', position: { x: 700, y: 400 }, radius: 50, points: 150, controlledBy: 'ENEMY', captureProgress: 0 },
      { id: 'obj-3', name: 'Village', position: { x: 900, y: 350 }, radius: 80, points: 200, controlledBy: 'ENEMY', captureProgress: 0 },
      { id: 'obj-4', name: 'Bridge', position: { x: 600, y: 200 }, radius: 40, points: 250, controlledBy: 'NEUTRAL', captureProgress: 0 }
    ];
  }

  private createVisibilityMap(): boolean[][] {
    // 120x80 grid (10px per cell on 1200x800 map)
    const map: boolean[][] = [];
    for (let y = 0; y < 80; y++) {
      map[y] = [];
      for (let x = 0; x < 120; x++) {
        map[y][x] = false;
      }
    }
    return map;
  }

  public update(deltaTime: number): void {
    if (this.state.isPaused) return;

    const scaledDelta = deltaTime * this.state.gameSpeed;
    this.state.gameTime += scaledDelta;

    this.updateVisibility();
    this.updateCompanyMovement(scaledDelta);
    this.processCombat();
    this.updateObjectives();
    this.processSupply(scaledDelta);
    this.updateAI(scaledDelta);
    this.updateMetrics();
    this.checkVictory();
  }

  private updateVisibility(): void {
    // Reset visibility
    for (let y = 0; y < 80; y++) {
      for (let x = 0; x < 120; x++) {
        this.state.visibilityMap[y][x] = false;
      }
    }

    // Set visibility from friendly units
    for (const company of this.state.friendlyCompanies) {
      if (company.status === CompanyStatus.DESTROYED) continue;

      const spec = COMPANY_SPECS[company.type];
      const range = spec.viewRange;
      const gridX = Math.floor(company.position.x / 10);
      const gridY = Math.floor(company.position.y / 10);
      const gridRange = Math.ceil(range / 10);

      for (let dy = -gridRange; dy <= gridRange; dy++) {
        for (let dx = -gridRange; dx <= gridRange; dx++) {
          const x = gridX + dx;
          const y = gridY + dy;
          if (x >= 0 && x < 120 && y >= 0 && y < 80) {
            if (dx * dx + dy * dy <= gridRange * gridRange) {
              this.state.visibilityMap[y][x] = true;
            }
          }
        }
      }
    }

    // Update enemy visibility
    for (const enemy of this.state.enemyCompanies) {
      const gridX = Math.floor(enemy.position.x / 10);
      const gridY = Math.floor(enemy.position.y / 10);
      if (gridX >= 0 && gridX < 120 && gridY >= 0 && gridY < 80) {
        enemy.isVisible = this.state.visibilityMap[gridY][gridX];
        if (enemy.isVisible) {
          enemy.lastContact = this.state.gameTime;
        }
      }
    }
  }

  private updateCompanyMovement(deltaTime: number): void {
    const allCompanies = [...this.state.friendlyCompanies, ...this.state.enemyCompanies];

    for (const company of allCompanies) {
      if (company.status === CompanyStatus.DESTROYED) continue;
      if (!company.destination) continue;
      if (company.fuel <= 0) {
        company.status = CompanyStatus.IDLE;
        continue;
      }

      const spec = COMPANY_SPECS[company.type];
      const speed = spec.speed * (deltaTime / 1000) * (company.fuel / 100);

      const dx = company.destination.x - company.position.x;
      const dy = company.destination.y - company.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= speed) {
        company.position = { ...company.destination };
        company.destination = null;
        company.status = CompanyStatus.IDLE;
      } else {
        company.position.x += (dx / distance) * speed;
        company.position.y += (dy / distance) * speed;
        company.status = CompanyStatus.MOVING;
        company.fuel -= deltaTime * 0.001;
      }
    }
  }

  private processCombat(): void {
    for (const friendly of this.state.friendlyCompanies) {
      if (friendly.status === CompanyStatus.DESTROYED) continue;

      for (const enemy of this.state.enemyCompanies) {
        if (enemy.status === CompanyStatus.DESTROYED) continue;

        const distance = this.calculateDistance(friendly.position, enemy.position);
        const engageRange = 80;

        if (distance <= engageRange) {
          // Combat occurs
          const friendlySpec = COMPANY_SPECS[friendly.type];
          const enemySpec = COMPANY_SPECS[enemy.type];

          const friendlyPower = friendlySpec.firepower * (friendly.strength / 100) * (friendly.ammunition / 100);
          const enemyPower = enemySpec.firepower * (enemy.strength / 100);

          const friendlyDamage = (enemyPower / friendlySpec.armor) * 0.5 * (Math.random() * 0.4 + 0.8);
          const enemyDamage = (friendlyPower / enemySpec.armor) * 0.5 * (Math.random() * 0.4 + 0.8);

          friendly.strength = Math.max(0, friendly.strength - friendlyDamage);
          enemy.strength = Math.max(0, enemy.strength - enemyDamage);

          friendly.ammunition = Math.max(0, friendly.ammunition - 2);
          friendly.morale = Math.max(0, friendly.morale - 1);
          enemy.morale = Math.max(0, enemy.morale - 1);

          if (friendly.strength <= 0) {
            friendly.status = CompanyStatus.DESTROYED;
            this.state.casualties += friendly.maxStrength;
            this.addLog(`${friendly.designation} destroyed!`, 'combat', 'critical');
          }

          if (enemy.strength <= 0) {
            enemy.status = CompanyStatus.DESTROYED;
            this.state.enemyCasualties += enemy.maxStrength;
            this.state.score += 50;
            this.addLog(`Enemy ${enemy.designation} destroyed!`, 'combat', 'high');
          }
        }
      }
    }
  }

  private updateObjectives(): void {
    let held = 0;

    for (const objective of this.state.objectives) {
      let friendlyPresence = 0;
      let enemyPresence = 0;

      for (const company of this.state.friendlyCompanies) {
        if (company.status === CompanyStatus.DESTROYED) continue;
        if (this.calculateDistance(company.position, objective.position) <= objective.radius) {
          friendlyPresence += company.strength;
        }
      }

      for (const enemy of this.state.enemyCompanies) {
        if (enemy.status === CompanyStatus.DESTROYED) continue;
        if (this.calculateDistance(enemy.position, objective.position) <= objective.radius) {
          enemyPresence += enemy.strength;
        }
      }

      if (friendlyPresence > enemyPresence && friendlyPresence > 50) {
        objective.captureProgress = Math.min(100, objective.captureProgress + 0.5);
        if (objective.captureProgress >= 100 && objective.controlledBy !== 'FRIENDLY') {
          objective.controlledBy = 'FRIENDLY';
          this.state.score += objective.points;
          this.addLog(`${objective.name} captured!`, 'objective', 'high');
        }
      } else if (enemyPresence > friendlyPresence && enemyPresence > 50) {
        objective.captureProgress = Math.max(0, objective.captureProgress - 0.5);
        if (objective.captureProgress <= 0 && objective.controlledBy === 'FRIENDLY') {
          objective.controlledBy = 'ENEMY';
          this.addLog(`${objective.name} lost!`, 'objective', 'critical');
        }
      }

      if (objective.controlledBy === 'FRIENDLY') held++;
    }

    this.state.objectivesHeld = held;
  }

  private processSupply(deltaTime: number): void {
    for (const company of this.state.friendlyCompanies) {
      if (company.status === CompanyStatus.DESTROYED) continue;

      // Check proximity to supply depots
      for (const depot of this.state.supplyDepots) {
        if (!depot.isActive) continue;

        const distance = this.calculateDistance(company.position, depot.position);
        if (distance <= 50) {
          // Resupply
          if (company.ammunition < 100 && depot.ammunition > 0) {
            const resupply = Math.min(5, 100 - company.ammunition, depot.ammunition);
            company.ammunition += resupply;
            depot.ammunition -= resupply;
          }
          if (company.fuel < 100 && depot.fuel > 0) {
            const refuel = Math.min(10, 100 - company.fuel, depot.fuel);
            company.fuel += refuel;
            depot.fuel -= refuel;
          }
        }
      }
    }

    // Calculate overall supply status
    const totalAmmo = this.state.supplyDepots.reduce((sum, d) => sum + d.ammunition, 0);
    const totalFuel = this.state.supplyDepots.reduce((sum, d) => sum + d.fuel, 0);
    this.state.supplyStatus = Math.floor((totalAmmo + totalFuel) / 50);
  }

  private updateAI(deltaTime: number): void {
    // Simple enemy AI - move towards objectives
    for (const enemy of this.state.enemyCompanies) {
      if (enemy.status === CompanyStatus.DESTROYED) continue;
      if (enemy.destination) continue;
      if (Math.random() > 0.01) continue; // Only occasionally issue orders

      // Find nearest friendly-controlled objective
      let nearestObjective: Objective | null = null;
      let nearestDistance = Infinity;

      for (const obj of this.state.objectives) {
        if (obj.controlledBy === 'FRIENDLY') {
          const dist = this.calculateDistance(enemy.position, obj.position);
          if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestObjective = obj;
          }
        }
      }

      if (nearestObjective) {
        enemy.destination = { ...nearestObjective.position };
      }
    }
  }

  private updateMetrics(): void {
    // Update combat effectiveness for all companies
    for (const company of this.state.friendlyCompanies) {
      company.combatEffectiveness =
        (company.strength / 100) *
        (company.morale / 100) *
        (company.ammunition / 100) * 100;
    }
  }

  private checkVictory(): void {
    const allEnemiesDestroyed = this.state.enemyCompanies.every(e => e.status === CompanyStatus.DESTROYED);
    const allObjectivesHeld = this.state.objectives.every(o => o.controlledBy === 'FRIENDLY');

    if (allEnemiesDestroyed || allObjectivesHeld) {
      this.addLog('Victory! All objectives secured!', 'system', 'critical');
      this.state.isPaused = true;
    }

    const allFriendlyDestroyed = this.state.friendlyCompanies.every(c => c.status === CompanyStatus.DESTROYED);
    if (allFriendlyDestroyed) {
      this.addLog('Defeat! Brigade destroyed!', 'system', 'critical');
      this.state.isPaused = true;
    }
  }

  private calculateDistance(a: Position, b: Position): number {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  private addLog(message: string, type: BrigadeLogEntry['type'], priority: BrigadeLogEntry['priority'] = 'medium'): void {
    this.state.log.push({ time: this.state.gameTime, message, type, priority });
    if (this.state.log.length > 100) this.state.log.shift();
  }

  // Public methods
  public issueOrder(companyId: string, type: CommandType, target: Position): void {
    const company = this.state.friendlyCompanies.find(c => c.id === companyId);
    if (!company) return;

    if (type === CommandType.MOVE) {
      company.destination = target;
      company.status = CompanyStatus.MOVING;
      this.addLog(`${company.designation} moving to grid ${Math.floor(target.x)},${Math.floor(target.y)}`, 'movement', 'low');
    } else if (type === CommandType.ATTACK) {
      company.destination = target;
      company.status = CompanyStatus.ATTACKING;
      this.addLog(`${company.designation} attacking position`, 'combat', 'medium');
    } else if (type === CommandType.DEFEND) {
      company.destination = null;
      company.status = CompanyStatus.DEFENDING;
      this.addLog(`${company.designation} defending position`, 'movement', 'low');
    }
  }

  public selectCompany(id: string | null): void {
    this.state.selectedCompany = id;
  }

  public setGameSpeed(speed: number): void {
    this.state.gameSpeed = speed;
  }

  public togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
  }

  public getState(): BrigadeGameState {
    return this.state;
  }
}
