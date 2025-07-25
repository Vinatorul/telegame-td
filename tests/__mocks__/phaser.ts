const mockTween = {
  add: jest.fn().mockImplementation(({ onComplete }) => {
    if (onComplete) onComplete();
    return { remove: jest.fn() };
  })
};

const mockScene = {
  add: {
    existing: jest.fn(),
    container: jest.fn().mockImplementation(() => ({
      setVisible: jest.fn(),
      add: jest.fn(),
      removeAll: jest.fn()
    })),
    graphics: jest.fn().mockImplementation(() => ({
      clear: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      strokeCircle: jest.fn().mockReturnThis(),
      strokeRect: jest.fn().mockReturnThis(),
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      fillCircle: jest.fn().mockReturnThis(),
      destroy: jest.fn(),
      x: 0,
      y: 0
    })),
    rectangle: jest.fn().mockImplementation(() => ({
      setStrokeStyle: jest.fn(),
      setInteractive: jest.fn(),
      on: jest.fn(),
      fillColor: 0
    })),
    text: jest.fn().mockImplementation(() => ({
      setOrigin: jest.fn(),
      setText: jest.fn()
    })),
    arc: jest.fn().mockImplementation(() => ({
      setFillStyle: jest.fn()
    }))
  },
  tweens: mockTween,
  events: {
    emit: jest.fn()
  }
};

const mockPhaser = {
  AUTO: 'auto',
  Scene: class {},
  Scale: {
    FIT: 'fit',
    CENTER_BOTH: 'center-both'
  },
  GameObjects: {
    Container: class {
      scene: any;
      x: number;
      y: number;
      constructor(scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
      }
      add() {
        return this;
      }
      setInteractive() {
        return this;
      }
      on() {
        return this;
      }
      setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
      }
      setActive() {
        return this;
      }
      setVisible() {
        return this;
      }
      destroy() {
        return this;
      }
    },
    Rectangle: class {
      scene: any;
      x: number;
      y: number;
      width: number;
      height: number;
      fillColor: number;
      constructor(scene: any, x: number, y: number, width: number, height: number, color: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fillColor = color;
      }
    },
    Graphics: class {
      clear() {
        return this;
      }
      lineStyle() {
        return this;
      }
      strokeCircle() {
        return this;
      }
      strokeRect() {
        return this;
      }
      fillStyle() {
        return this;
      }
      fillRect() {
        return this;
      }
      fillCircle() {
        return this;
      }
    },
    Group: class {
      getChildren() {
        return [];
      }
    },
    Arc: class {
      constructor(
        scene?: any,
        x?: number,
        y?: number,
        radius?: number,
        _startAngle?: number,
        _endAngle?: number
      ) {
        this.scene = scene;
        this.x = x || 0;
        this.y = y || 0;
        this.radius = radius || 0;
      }
      scene: any;
      x: number;
      y: number;
      radius: number;
    }
  },
  Geom: {
    Rectangle: class {
      constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }
      x: number;
      y: number;
      width: number;
      height: number;
      static Contains: () => true;
    }
  },
  Math: {
    Distance: {
      Between: (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      }
    },
    Vector2: class {
      x = 0;
      y = 0;
      constructor(x?: number, y?: number) {
        if (x !== undefined) this.x = x;
        if (y !== undefined) this.y = y;
      }
    }
  },
  Curves: {
    Path: class {
      moveTo() {
        return this;
      }
      lineTo() {
        return this;
      }
      getPoint(t: number, vec: any) {
        vec.x = 100;
        vec.y = 100;
        return vec;
      }
    }
  },
  Types: {
    Core: {}
  }
};

module.exports = mockPhaser;
export { mockScene };
