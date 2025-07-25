import { Tower } from '../../src/objects/Tower';
import { TowerType, TowerLevel, TOWERS } from '../../src/config/towerConfig';

describe('Tower', () => {
  let mockScene: any;
  let tower: Tower;

  beforeEach(() => {
    mockScene = {
      add: {
        existing: jest.fn(),
        container: jest.fn().mockReturnValue({
          setVisible: jest.fn(),
          add: jest.fn(),
          removeAll: jest.fn()
        }),
        graphics: jest.fn().mockReturnValue({
          clear: jest.fn(),
          lineStyle: jest.fn(),
          strokeCircle: jest.fn(),
          fillStyle: jest.fn(),
          fillCircle: jest.fn(),
          destroy: jest.fn(),
          x: 0,
          y: 0
        }),
        rectangle: jest.fn().mockReturnValue({
          setStrokeStyle: jest.fn(),
          setInteractive: jest.fn(),
          on: jest.fn(),
          fillColor: 0
        }),
        text: jest.fn().mockReturnValue({
          setOrigin: jest.fn(),
          setText: jest.fn()
        })
      },
      tweens: {
        add: jest.fn().mockImplementation(({ onComplete }) => {
          if (onComplete) onComplete();
          return { remove: jest.fn() };
        })
      },
      gold: 1000,
      goldText: {
        setText: jest.fn()
      },
      towers: {
        getChildren: jest.fn().mockReturnValue([])
      },
      addToGameField: jest.fn()
    };

    tower = new Tower(mockScene, 100, 100, TowerType.BASIC);
  });

  test('should initialize with correct properties', () => {
    const config = TOWERS[TowerType.BASIC].levels[TowerLevel.LEVEL_1];

    expect(tower).toBeDefined();
    expect(tower['towerType']).toBe(TowerType.BASIC);
    expect(tower['level']).toBe(TowerLevel.LEVEL_1);
    expect(tower['range']).toBe(config.range);
    expect(tower['fireRate']).toBe(config.fireRate);
    expect(tower['damage']).toBe(config.damage);
  });

  test('should upgrade tower when gold is sufficient', () => {
    const initialLevel = tower['level'];
    const nextLevel = initialLevel + 1;
    const upgradeCost = TOWERS[TowerType.BASIC].levels[nextLevel].upgradeCost || 0;

    const result = tower['tryUpgrade']();

    expect(result).toBe(true);
    expect(tower['level']).toBe(nextLevel);
    expect(mockScene.gold).toBe(1000 - upgradeCost);
    expect(mockScene.goldText.setText).toHaveBeenCalledWith(`Gold: ${1000 - upgradeCost}`);
  });

  test('should not upgrade tower when at max level', () => {
    tower['level'] = TowerLevel.LEVEL_3;

    const result = tower.upgrade();

    expect(result).toBe(false);
    expect(tower['level']).toBe(TowerLevel.LEVEL_3);
  });

  test('should fire at enemy when in range', () => {
    const mockEnemy = {
      x: 150,
      y: 150,
      takeDamage: jest.fn(),
      destroyed: false
    };

    const mockEnemies = {
      getChildren: jest.fn().mockReturnValue([mockEnemy])
    };

    tower.update(2000, mockEnemies as any);

    expect(mockScene.tweens.add).toHaveBeenCalled();
    expect(mockEnemy.takeDamage).toHaveBeenCalledWith(tower['damage']);
  });

  test('should select and deselect tower', () => {
    const drawRangeSpy = jest.spyOn(tower as any, 'drawRange');

    tower['selectTower']();

    expect(tower['selected']).toBe(true);
    expect(drawRangeSpy).toHaveBeenCalledWith(true);

    tower.deselectTower();

    expect(tower['selected']).toBe(false);
    expect(drawRangeSpy).toHaveBeenCalledWith(false);
  });
});
