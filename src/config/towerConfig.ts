export enum TowerLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3
}

export enum TowerType {
  BASIC = 'basic',
  ARCHER = 'archer',
  MAGE = 'mage'
}

export interface LevelConfig {
  color: number;
  range: number;
  fireRate: number;
  damage: number;
}

export interface BulletConfig {
  color: number;
  size: number;
  duration: number;
}

export interface TowerConfig {
  levels: Record<TowerLevel, LevelConfig>;
  bullet: BulletConfig;
}

export const TOWERS: Record<TowerType, TowerConfig> = {
  [TowerType.BASIC]: {
    levels: {
      [TowerLevel.LEVEL_1]: {
        color: 0x3498db,
        range: 150,
        fireRate: 1000,
        damage: 20
      },
      [TowerLevel.LEVEL_2]: {
        color: 0x2980b9,
        range: 200,
        fireRate: 800,
        damage: 30
      },
      [TowerLevel.LEVEL_3]: {
        color: 0x1c4966,
        range: 250,
        fireRate: 600,
        damage: 45
      }
    },
    bullet: {
      color: 0xff0000,
      size: 5,
      duration: 200
    }
  },
  [TowerType.ARCHER]: {
    levels: {
      [TowerLevel.LEVEL_1]: {
        color: 0x2ecc71,
        range: 200,
        fireRate: 1200,
        damage: 15
      },
      [TowerLevel.LEVEL_2]: {
        color: 0x27ae60,
        range: 250,
        fireRate: 1000,
        damage: 25
      },
      [TowerLevel.LEVEL_3]: {
        color: 0x1e8449,
        range: 300,
        fireRate: 800,
        damage: 40
      }
    },
    bullet: {
      color: 0x2ecc71,
      size: 3,
      duration: 150
    }
  },
  [TowerType.MAGE]: {
    levels: {
      [TowerLevel.LEVEL_1]: {
        color: 0x9b59b6,
        range: 150,
        fireRate: 1500,
        damage: 30
      },
      [TowerLevel.LEVEL_2]: {
        color: 0x8e44ad,
        range: 200,
        fireRate: 1300,
        damage: 40
      },
      [TowerLevel.LEVEL_3]: {
        color: 0x6c3483,
        range: 250,
        fireRate: 1100,
        damage: 55
      }
    },
    bullet: {
      color: 0x9b59b6,
      size: 7,
      duration: 300
    }
  }
};
