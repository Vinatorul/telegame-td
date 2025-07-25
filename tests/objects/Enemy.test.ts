import { Enemy } from '../../src/objects/Enemy';
import { EnemyType, ENEMIES } from '../../src/config/enemyConfig';

describe('Enemy', () => {
  let enemy: Enemy;
  let mockPath: any;

  beforeEach(() => {
    mockPath = {
      getPoint: jest.fn().mockImplementation((t, vec) => {
        vec.x = 100 + t * 100;
        vec.y = 100 + t * 100;
        return vec;
      })
    };

    const testScene = {
      add: {
        existing: jest.fn(),
        graphics: jest.fn().mockReturnValue({
          clear: jest.fn().mockReturnThis(),
          lineStyle: jest.fn().mockReturnThis(),
          strokeCircle: jest.fn().mockReturnThis(),
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis()
        })
      },
      events: {
        emit: jest.fn()
      }
    };

    enemy = new Enemy(testScene as any, mockPath, EnemyType.SCOUT_MOUSE);
  });

  test('should initialize with correct properties', () => {
    const config = ENEMIES[EnemyType.SCOUT_MOUSE];

    expect(enemy).toBeDefined();
    expect(enemy['enemyType']).toBe(EnemyType.SCOUT_MOUSE);
    expect(enemy['health']).toBe(config.health);
    expect(enemy['maxHealth']).toBe(config.health);
    expect(enemy['speed']).toBe(config.speed);
    expect(enemy['reward']).toBe(config.reward);
  });

  test('should update position based on path', () => {
    const initialX = enemy.x;
    const initialY = enemy.y;

    enemy.update();

    expect(enemy.x).not.toBe(initialX);
    expect(enemy.y).not.toBe(initialY);
    expect(enemy['follower'].t).toBeGreaterThan(0);
  });

  test('should take damage and update health', () => {
    const initialHealth = enemy['health'];
    const damage = 20;

    enemy.takeDamage(damage);

    expect(enemy['health']).toBe(initialHealth - damage);
  });

  test('should emit event and destroy when health reaches zero', () => {
    const destroySpy = jest.spyOn(enemy, 'destroy');
    const emitSpy = jest.spyOn(enemy['scene'].events, 'emit');

    enemy['health'] = 10;
    enemy.takeDamage(20);

    expect(emitSpy).toHaveBeenCalledWith('enemyDefeated', enemy['reward']);
    expect(destroySpy).toHaveBeenCalled();
  });

  test('should detect when enemy reaches end of path', () => {
    expect(enemy.isAtEnd()).toBe(false);

    enemy['follower'].t = 1;

    expect(enemy.isAtEnd()).toBe(true);
  });

  test('should set path', () => {
    const newPath = { getPoint: jest.fn() };

    enemy.setPath(newPath as any);

    expect(enemy['path']).toBe(newPath);
  });

  test('should update health bar based on health percentage', () => {
    const clearSpy = jest.spyOn(enemy['healthBar'], 'clear');
    const fillStyleSpy = jest.spyOn(enemy['healthBar'], 'fillStyle');

    enemy.takeDamage(10);

    expect(clearSpy).toHaveBeenCalled();
    expect(fillStyleSpy).toHaveBeenCalled();
  });

  test('should mark as destroyed when destroyed', () => {
    expect(enemy.destroyed).toBe(false);

    enemy.destroy();

    expect(enemy.destroyed).toBe(true);
  });
});
