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
        now: 1000,
        delayedCall: jest.fn()
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

  test('should detect pinch gesture with two touch points', () => {
    const pointer1 = { ...mockPointer, id: 1, x: 100, y: 100, isDown: true };
    const pointer2 = { ...mockPointer, id: 2, x: 200, y: 200, isDown: true };

    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(pointer1);
    handleTouchStart(pointer2);

    expect(touchManager['activeTouches'].size).toBe(2);
    expect(touchManager['activeTouches'].has(1)).toBe(true);
    expect(touchManager['activeTouches'].has(2)).toBe(true);

    mockScene.input.manager.pointers = [pointer1, pointer2];
    touchManager.update();

    const handlePinchGesture = touchManager['handlePinchGesture'].bind(touchManager);
    handlePinchGesture([pointer1, pointer2]);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.PINCH_START,
      expect.objectContaining({
        center: expect.any(Object),
        distance: expect.any(Number),
        pointers: expect.arrayContaining([1, 2])
      })
    );

    const movedPointer1 = { ...pointer1, x: 50, y: 50, isDown: true };
    const movedPointer2 = { ...pointer2, x: 250, y: 250, isDown: true };

    touchManager['activeTouches'].get(1).previousPinchDistance = 141.4; // Approximate distance between (100,100) and (200,200)
    touchManager['activeTouches'].get(2).previousPinchDistance = 141.4;

    handlePinchGesture([movedPointer1, movedPointer2]);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.PINCH_MOVE,
      expect.objectContaining({
        center: expect.any(Object),
        distance: expect.any(Number),
        previousDistance: expect.any(Number),
        scaleFactor: expect.any(Number)
      })
    );

    const handleTouchEnd = touchManager['handleTouchEnd'].bind(touchManager);
    handleTouchEnd(movedPointer1);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.PINCH_END,
      expect.objectContaining({
        id: 1,
        x: 50,
        y: 50,
        otherPointerId: expect.any(Number)
      })
    );
  });

  test('should update multiple active pointers correctly', () => {
    const zones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(0, 0, 800, 600)
    };
    touchManager.setTouchZones(zones);

    const pointer1 = { ...mockPointer, id: 1, x: 100, y: 150, isDown: true };
    const pointer2 = { ...mockPointer, id: 2, x: 200, y: 250, isDown: true };

    mockScene.input.manager.pointers = [pointer1, pointer2];

    touchManager.update();

    expect(touchManager['activeTouches'].size).toBe(2);
    expect(touchManager['activeTouches'].has(1)).toBe(true);
    expect(touchManager['activeTouches'].has(2)).toBe(true);

    const updatedPointer1 = { ...pointer1, x: 120, y: 170, isDown: true };
    const updatedPointer2 = { ...pointer2, x: 220, y: 270, isDown: true };

    mockScene.input.manager.pointers = [updatedPointer1, updatedPointer2];

    touchManager.update();

    expect(touchManager['activeTouches'].get(1).x).toBe(120);
    expect(touchManager['activeTouches'].get(1).y).toBe(170);
    expect(touchManager['activeTouches'].get(2).x).toBe(220);
    expect(touchManager['activeTouches'].get(2).y).toBe(270);
  });

  test('should handle simultaneous drag operations', () => {
    const zones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(0, 0, 800, 600)
    };
    touchManager.setTouchZones(zones);

    const pointer1 = { ...mockPointer, id: 1, x: 100, y: 150 };
    const pointer2 = { ...mockPointer, id: 2, x: 200, y: 250 };

    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(pointer1);
    handleTouchStart(pointer2);

    const handleTouchMove = touchManager['handleTouchMove'].bind(touchManager);

    const movedPointer1 = { ...pointer1, x: 150, y: 200 };
    const movedPointer2 = { ...pointer2, x: 250, y: 300 };

    handleTouchMove(movedPointer1);
    handleTouchMove(movedPointer2);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_START,
      expect.objectContaining({
        id: 1,
        x: 150,
        y: 200
      })
    );

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_START,
      expect.objectContaining({
        id: 2,
        x: 250,
        y: 300
      })
    );

    const furtherMovedPointer1 = { ...movedPointer1, x: 160, y: 210 };
    const furtherMovedPointer2 = { ...movedPointer2, x: 260, y: 310 };

    handleTouchMove(furtherMovedPointer1);
    handleTouchMove(furtherMovedPointer2);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_MOVE,
      expect.objectContaining({
        id: 1,
        x: 160,
        y: 210,
        deltaX: expect.any(Number),
        deltaY: expect.any(Number)
      })
    );

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_MOVE,
      expect.objectContaining({
        id: 2,
        x: 260,
        y: 310,
        deltaX: expect.any(Number),
        deltaY: expect.any(Number)
      })
    );
  });

  test('should clean up all touches when pointers are released', () => {
    const pointer1 = { ...mockPointer, id: 1, x: 100, y: 150 };
    const pointer2 = { ...mockPointer, id: 2, x: 200, y: 250 };

    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(pointer1);
    handleTouchStart(pointer2);

    expect(touchManager['activeTouches'].size).toBe(2);

    mockScene.input.manager.pointers = [];
    touchManager.update();

    expect(touchManager['activeTouches'].size).toBe(0);
  });

  test('should handle transition from drag to pinch gesture', () => {
    const zones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(0, 0, 800, 600)
    };
    touchManager.setTouchZones(zones);

    const pointer1 = { ...mockPointer, id: 1, x: 100, y: 150, isDown: true };
    const handleTouchStart = touchManager['handleTouchStart'].bind(touchManager);
    handleTouchStart(pointer1);

    const movedPointer1 = { ...pointer1, x: 120, y: 170 };
    const handleTouchMove = touchManager['handleTouchMove'].bind(touchManager);
    handleTouchMove(movedPointer1);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.DRAG_START,
      expect.objectContaining({
        id: 1,
        control: 'gameField'
      })
    );

    const pointer2 = { ...mockPointer, id: 2, x: 200, y: 250, isDown: true };
    handleTouchStart(pointer2);

    mockScene.input.manager.pointers = [movedPointer1, pointer2];
    touchManager.update();

    const handlePinchGesture = touchManager['handlePinchGesture'].bind(touchManager);
    handlePinchGesture([movedPointer1, pointer2]);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.PINCH_START,
      expect.objectContaining({
        pointers: expect.arrayContaining([1, 2])
      })
    );

    const furtherMovedPointer1 = { ...movedPointer1, x: 80, y: 130 };
    const movedPointer2 = { ...pointer2, x: 220, y: 270 };

    touchManager['activeTouches'].get(1).previousPinchDistance = Math.sqrt(
      Math.pow(movedPointer1.x - pointer2.x, 2) + Math.pow(movedPointer1.y - pointer2.y, 2)
    );
    touchManager['activeTouches'].get(2).previousPinchDistance =
      touchManager['activeTouches'].get(1).previousPinchDistance;

    handlePinchGesture([furtherMovedPointer1, movedPointer2]);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.PINCH_MOVE,
      expect.objectContaining({
        scaleFactor: expect.any(Number)
      })
    );

    const handleTouchEnd = touchManager['handleTouchEnd'].bind(touchManager);
    handleTouchEnd(furtherMovedPointer1);

    expect(mockScene.events.emit).toHaveBeenCalledWith(
      TouchEvents.PINCH_END,
      expect.objectContaining({
        id: 1
      })
    );
  });
});
