import { Mission } from '@shared/types';

export const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    name: 'OPERAȚIUNEA COBRA',
    type: 'OFFENSIVE',
    description: 'Atacă și capturează cele 3 dealuri strategice',
    briefing: `SITUATION:
Enemy forces have fortified three strategic hills overlooking our supply routes. Intelligence indicates battalion-strength opposition with armored support.

MISSION:
Attack and capture all three objective hills. Maintain control until mission timer expires.

EXECUTION:
- Primary effort: Capture Hill 301 (north)
- Supporting effort: Capture Hill 285 (center) and Hill 312 (south)
- Use combined arms tactics - coordinate infantry, armor, and artillery

SUCCESS CRITERIA:
- Capture all three objectives
- Keep casualties below 40%
- Complete mission within 45 minutes`,
    duration: 2700, // 45 minutes
    difficulty: 'MEDIUM',

    objectives: [
      {
        id: 'obj-1',
        name: 'Hill 301',
        description: 'Northern strategic position',
        position: { x: 900, y: 200 },
        type: 'CAPTURE',
        status: 'PENDING',
        radius: 80,
        value: 100,
        required: true
      },
      {
        id: 'obj-2',
        name: 'Hill 285',
        description: 'Central observation post',
        position: { x: 850, y: 400 },
        type: 'CAPTURE',
        status: 'PENDING',
        radius: 80,
        value: 100,
        required: true
      },
      {
        id: 'obj-3',
        name: 'Hill 312',
        description: 'Southern strongpoint',
        position: { x: 900, y: 600 },
        type: 'CAPTURE',
        status: 'PENDING',
        radius: 80,
        value: 100,
        required: true
      }
    ],

    playerForces: {
      infantry: 2,
      armor: 1,
      artillery: 1,
      recon: 1
    },

    enemyForces: {
      infantry: 2,
      armor: 1,
      artillery: 0,
      recon: 0
    },

    mapSize: '5km x 5km',
    startTime: 'DAY',
    weather: 'CLEAR',

    victoryConditions: [
      'Capture all three objectives',
      'Maintain control for 5 minutes',
      'Keep casualties below 50%'
    ],

    defeatConditions: [
      'Lose more than 70% of forces',
      'Fail to capture objectives in time limit',
      'All command units destroyed'
    ]
  },

  {
    id: 'mission-2',
    name: 'APĂRAREA PODULUI',
    type: 'DEFENSIVE',
    description: 'Apără podul împotriva atacului inamic timp de 30 minute',
    briefing: `SITUATION:
Enemy forces are advancing to capture the strategic bridge at our position. Reinforcements are 30 minutes away.

MISSION:
Defend the bridge and deny enemy crossing until reinforcements arrive.

EXECUTION:
- Establish defensive positions covering bridge approaches
- Use natural obstacles and terrain for advantage
- Conserve ammunition - resupply is limited
- Artillery support available for critical situations

SUCCESS CRITERIA:
- Maintain bridge control for 30 minutes
- Inflict heavy casualties on attackers
- Preserve at least 40% of defending force`,
    duration: 1800, // 30 minutes
    difficulty: 'HARD',

    objectives: [
      {
        id: 'obj-bridge',
        name: 'Bridge',
        description: 'Critical river crossing',
        position: { x: 400, y: 400 },
        type: 'DEFEND',
        status: 'PENDING',
        radius: 100,
        controlledBy: 'FRIENDLY',
        value: 200,
        required: true
      }
    ],

    playerForces: {
      infantry: 2,
      armor: 0,
      artillery: 1,
      recon: 1
    },

    enemyForces: {
      infantry: 3,
      armor: 2,
      artillery: 1,
      recon: 1
    },

    mapSize: '3km x 3km',
    startTime: 'DAWN',
    weather: 'FOG',

    victoryConditions: [
      'Hold bridge for 30 minutes',
      'Eliminate at least 50% of enemy forces',
      'Preserve 40% of friendly forces'
    ],

    defeatConditions: [
      'Lose control of bridge',
      'Lose more than 60% of forces',
      'Bridge destroyed'
    ]
  },

  {
    id: 'mission-3',
    name: 'NOAPTE ÎN INFERN',
    type: 'NIGHT_OPERATION',
    description: 'Operație nocturnă - infiltrare și distrugere',
    briefing: `SITUATION:
Under cover of darkness, infiltrate enemy rear area and destroy their ammunition depot.

MISSION:
Conduct night raid on enemy supply depot. Destroy target and exfiltrate before dawn.

EXECUTION:
- Use darkness for concealment
- Avoid detection - stealth is key
- Recon element leads, infantry follows
- Artillery on standby for emergency support
- Exfiltration route secured

SUCCESS CRITERIA:
- Destroy ammunition depot
- Minimize friendly casualties
- Avoid raising general alarm`,
    duration: 1200, // 20 minutes
    difficulty: 'EXTREME',

    objectives: [
      {
        id: 'obj-depot',
        name: 'Ammo Depot',
        description: 'Enemy supply depot',
        position: { x: 1000, y: 400 },
        type: 'DESTROY',
        status: 'PENDING',
        radius: 50,
        controlledBy: 'ENEMY',
        value: 300,
        required: true
      }
    ],

    playerForces: {
      infantry: 1,
      armor: 0,
      artillery: 0,
      recon: 2
    },

    enemyForces: {
      infantry: 2,
      armor: 1,
      artillery: 0,
      recon: 0
    },

    mapSize: '4km x 4km',
    startTime: 'NIGHT',
    weather: 'CLEAR',

    victoryConditions: [
      'Destroy ammunition depot',
      'Keep casualties below 30%',
      'Complete before dawn (20 minutes)'
    ],

    defeatConditions: [
      'Lose all recon units',
      'Fail to destroy depot in time',
      'Lose more than 50% of forces'
    ]
  }
];

export const DEFAULT_MISSION = MISSIONS[0];
