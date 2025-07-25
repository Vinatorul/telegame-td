export enum EnemyType {
  SCOUT_MOUSE = 'scout',
  SOLDIER_MOUSE = 'soldier',
  ARMORED_MOUSE = 'armored'
}

export interface EnemyConfig {
  health: number;
  speed: number;
  reward: number;
  radius: number;
  color: number;
}

export const ENEMIES: Record<EnemyType, EnemyConfig> = {
  [EnemyType.SCOUT_MOUSE]: {
    health: 50,
    speed: 0.0015,
    reward: 10,
    radius: 12,
    color: 0xe74c3c
  },
  [EnemyType.SOLDIER_MOUSE]: {
    health: 100,
    speed: 0.001,
    reward: 20,
    radius: 15,
    color: 0xf39c12
  },
  [EnemyType.ARMORED_MOUSE]: {
    health: 200,
    speed: 0.0007,
    reward: 30,
    radius: 18,
    color: 0x7f8c8d
  }
};
