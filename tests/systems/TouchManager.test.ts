import Phaser from 'phaser';
import TouchManager, { TouchEvents, TouchZones } from '../../src/systems/TouchManager';

describe('TouchManager', () => {
  let mockScene: any;
  let touchManager: TouchManager;
  let mockPointer: any;

  const originalContains = Phaser.Geom.Rectangle.Contains;

  beforeAll(() => {
    Phaser.Geom.Rectangle.Contains = jest.fn().mockImplementation((rect, x, y) => {
      return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    });
  });

  afterAll(() => {
    Phaser.Geom.Rectangle.Contains = originalContains;
  });

  beforeEach(() => {
    mockScene = {
      add: {
        graphics: jest.fn().mockReturnValue({
          clear: jest.fn().mockReturnThis(),
          lineStyle: jest.fn().mockReturnThis(),
          strokeRect: jest.fn().mockReturnThis(),
          fillStyle: jest.fn().mockReturnThis(),
          fillCircle: jest.fn().mockReturnThis(),
          lineBetween: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        }),
        text: jest.fn().mockReturnValue({
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setText: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })
      },
      input: {
        on: jest.fn(),
        off: jest.fn(),
        manager: {
          pointers: []
        }
      },
      events: {
        emit: jest.fn()
      },
      time: {
        now: 1000
      }
    };

    mockPointer = {
      id: 1,
      x: 100,
      y: 150,
      worldX: 100,
      worldY: 150,
      isDown: true
    };

    touchManager = new TouchManager(mockScene, true);
  });

  test('should initialize with correct properties', () => {
    expect(touchManager).toBeDefined();
    expect(mockScene.add.graphics).toHaveBeenCalled();
    expect(mockScene.add.text).toHaveBeenCalled();
    expect(mockScene.input.on).toHaveBeenCalledTimes(4);
  });

  test('should set touch zones', () => {
    const zones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(0, 0, 800, 600),
      towerSelector: new Phaser.Geom.Rectangle(20, 700, 400, 80)
    };

    touchManager.setTouchZones(zones);

    expect(touchManager['zones']).toEqual(zones);
  });

  test('should handle touch start', () => {
    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(mockPointer);

    expect(touchManager['activeTouches'].has(mockPointer.id)).toBe(true);
    const touchData = touchManager['activeTouches'].get(mockPointer.id);
    expect(touchData.x).toBe(mockPointer.x);
    expect(touchData.y).toBe(mockPointer.y);
    expect(touchData.startX).toBe(mockPointer.x);
    expect(touchData.startY).toBe(mockPointer.y);
    expect(touchData.startTime).toBe(mockScene.time.now);
  });

  test('should handle touch move and detect drag', () => {
    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    const handleTouchMove = touchManager['handleTouchMove'].bind(touchManager);

    handleTouchStart(mockPointer);

    const movedPointer = { ...mockPointer, x: 130, y: 180 };
    handleTouchMove(movedPointer);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_START,
      expect.objectContaining({
        id: mockPointer.id,
        x: movedPointer.x,
        y: movedPointer.y
      })
    );

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_MOVE,
      expect.objectContaining({
        id: mockPointer.id,
        x: movedPointer.x,
        y: movedPointer.y,
        deltaX: expect.any(Number),
        deltaY: expect.any(Number)
      })
    );
  });

  test('should handle touch end and emit tap event', () => {
    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    const handleTouchEnd = touchManager['handleTouchEnd'].bind(touchManager);

    handleTouchStart(mockPointer);
    handleTouchEnd(mockPointer);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.TAP,
      expect.objectContaining({
        id: mockPointer.id,
        x: mockPointer.x,
        y: mockPointer.y
      })
    );

    expect(touchManager['activeTouches'].has(mockPointer.id)).toBe(false);
  });

  test('should update and clean up stale touches', () => {
    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(mockPointer);

    mockScene.input.manager.pointers = [];
    touchManager.update();

    expect(touchManager['activeTouches'].has(mockPointer.id)).toBe(false);
  });

  test('should destroy and clean up event listeners', () => {
    touchManager.destroy();

    expect(mockScene.input.off).toHaveBeenCalledTimes(4);
  });

  test('should identify touch in game field zone', () => {
    const zones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(0, 0, 800, 600)
    };

    touchManager.setTouchZones(zones);

    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(mockPointer);

    const touchData = touchManager['activeTouches'].get(mockPointer.id);
    expect(touchData.control).toBe('gameField');
  });

  test('should identify touch in tower selector zone', () => {
    const zones: TouchZones = {
      towerSelector: new Phaser.Geom.Rectangle(50, 100, 200, 100)
    };

    touchManager.setTouchZones(zones);

    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(mockPointer);

    const touchData = touchManager['activeTouches'].get(mockPointer.id);
    expect(touchData.control).toBe('towerSelector');
  });

  test('should handle multiple touch points simultaneously', () => {
    const zones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(0, 0, 800, 600),
      towerSelector: new Phaser.Geom.Rectangle(50, 700, 200, 100)
    };
    touchManager.setTouchZones(zones);

    const pointer1 = { ...mockPointer, id: 1, x: 100, y: 150 };
    const pointer2 = { ...mockPointer, id: 2, x: 300, y: 250 };
    const pointer3 = { ...mockPointer, id: 3, x: 75, y: 750 };

    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);

    handleTouchStart(pointer1);
    handleTouchStart(pointer2);
    handleTouchStart(pointer3);

    expect(touchManager['activeTouches'].size).toBe(3);
    expect(touchManager['activeTouches'].has(1)).toBe(true);
    expect(touchManager['activeTouches'].has(2)).toBe(true);
    expect(touchManager['activeTouches'].has(3)).toBe(true);

    expect(touchManager['activeTouches'].get(1).control).toBe('gameField');
    expect(touchManager['activeTouches'].get(2).control).toBe('gameField');
    expect(touchManager['activeTouches'].get(3).control).toBe('towerSelector');

    const handleTouchMove = touchManager['handleTouchMove'].bind(touchManager);
    const movedPointer1 = { ...pointer1, x: 150, y: 200 };
    handleTouchMove(movedPointer1);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_START,
      expect.objectContaining({
        id: 1,
        x: 150,
        y: 200
      })
    );

    const handleTouchEnd = touchManager['handleTouchEnd'].bind(touchManager);
    handleTouchEnd(pointer2);

    expect(touchManager['activeTouches'].size).toBe(2);
    expect(touchManager['activeTouches'].has(1)).toBe(true);
    expect(touchManager['activeTouches'].has(2)).toBe(false);
    expect(touchManager['activeTouches'].has(3)).toBe(true);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.TAP,
      expect.objectContaining({
        id: 2,
        x: 300,
        y: 250
      })
    );
  });
});
