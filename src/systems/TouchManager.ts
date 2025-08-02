import Phaser from 'phaser';

export interface TouchZones {
  gameField?: Phaser.Geom.Rectangle;
  towerSelector?: Phaser.Geom.Rectangle;
  uiButtons?: Phaser.Geom.Rectangle[];
}

export enum TouchEvents {
  DRAG_START = 'touchDragStart',
  DRAG_MOVE = 'touchDragMove',
  DRAG_END = 'touchDragEnd',
  TAP = 'touchTap',
  LONG_PRESS = 'touchLongPress'
}

export default class TouchManager {
  private scene: Phaser.Scene;
  private activeTouches: Map<
    number,
    {
      x: number;
      y: number;
      startX: number;
      startY: number;
      startTime: number;
      control?: string;
      isDragging?: boolean;
    }
  >;

  private zones: TouchZones = {};

  private debugEnabled: boolean;
  private debugGraphics: Phaser.GameObjects.Graphics;
  private debugText: Phaser.GameObjects.Text;

  private dragThreshold = 10;
  private longPressThreshold = 500;

  constructor(scene: Phaser.Scene, debugEnabled = false) {
    this.scene = scene;
    this.activeTouches = new Map();
    this.debugEnabled = debugEnabled;

    if (this.debugEnabled) {
      this.debugGraphics = this.scene.add.graphics();
      this.debugText = this.scene.add.text(10, 10, 'Touch Debug', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000'
      });
      this.debugText.setScrollFactor(0);
      this.debugText.setDepth(1000);
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.scene.input.on('pointerdown', this.handleTouchStart, this);
    this.scene.input.on('pointermove', this.handleTouchMove, this);
    this.scene.input.on('pointerup', this.handleTouchEnd, this);
    this.scene.input.on('pointerupoutside', this.handleTouchEnd, this);
  }

  setTouchZones(zones: TouchZones) {
    this.zones = zones;
  }

  handleTouchStart(pointer: Phaser.Input.Pointer) {
    console.log('Touch start:', {
      id: pointer.id,
      x: pointer.x,
      y: pointer.y,
      isDown: pointer.isDown,
      active: pointer.active
    });

    this.activeTouches.set(pointer.id, {
      x: pointer.x,
      y: pointer.y,
      startX: pointer.x,
      startY: pointer.y,
      startTime: this.scene.time.now
    });

    this.updateControlsFromTouch(pointer.id, pointer.x, pointer.y);
  }

  handleTouchMove(pointer: Phaser.Input.Pointer) {
    if (this.activeTouches.has(pointer.id)) {
      const touchData = this.activeTouches.get(pointer.id);

      const distance = Phaser.Math.Distance.Between(
        touchData.startX,
        touchData.startY,
        pointer.x,
        pointer.y
      );

      if (!touchData.isDragging && distance > this.dragThreshold) {
        touchData.isDragging = true;

        this.scene.events.emit(TouchEvents.DRAG_START, {
          id: pointer.id,
          x: pointer.x,
          y: pointer.y,
          startX: touchData.startX,
          startY: touchData.startY,
          control: touchData.control
        });
      }

      if (touchData.isDragging) {
        this.scene.events.emit(TouchEvents.DRAG_MOVE, {
          id: pointer.id,
          x: pointer.x,
          y: pointer.y,
          deltaX: pointer.x - touchData.x,
          deltaY: pointer.y - touchData.y,
          control: touchData.control
        });
      }

      touchData.x = pointer.x;
      touchData.y = pointer.y;

      this.updateControlsFromTouch(pointer.id, pointer.x, pointer.y);
    }
  }

  handleTouchEnd(pointer: Phaser.Input.Pointer) {
    if (this.activeTouches.has(pointer.id)) {
      const touchData = this.activeTouches.get(pointer.id);
      const touchDuration = this.scene.time.now - touchData.startTime;

      const distance = Phaser.Math.Distance.Between(
        touchData.startX,
        touchData.startY,
        pointer.x,
        pointer.y
      );

      if (touchData.isDragging) {
        this.scene.events.emit(TouchEvents.DRAG_END, {
          id: pointer.id,
          x: pointer.x,
          y: pointer.y,
          startX: touchData.startX,
          startY: touchData.startY,
          control: touchData.control
        });
      } else if (distance < this.dragThreshold && touchDuration < this.longPressThreshold) {
        this.scene.events.emit(TouchEvents.TAP, {
          id: pointer.id,
          x: pointer.x,
          y: pointer.y,
          control: touchData.control
        });
      } else if (distance < this.dragThreshold && touchDuration >= this.longPressThreshold) {
        this.scene.events.emit(TouchEvents.LONG_PRESS, {
          id: pointer.id,
          x: pointer.x,
          y: pointer.y,
          duration: touchDuration,
          control: touchData.control
        });
      }

      this.activeTouches.delete(pointer.id);
    }
  }

  updateControlsFromTouch(id: number, x: number, y: number) {
    const touchData = this.activeTouches.get(id);

    if (this.zones.gameField && Phaser.Geom.Rectangle.Contains(this.zones.gameField, x, y)) {
      touchData.control = 'gameField';
    }

    if (
      this.zones.towerSelector &&
      Phaser.Geom.Rectangle.Contains(this.zones.towerSelector, x, y)
    ) {
      touchData.control = 'towerSelector';
    }

    if (this.zones.uiButtons) {
      this.zones.uiButtons.forEach((button, index) => {
        if (Phaser.Geom.Rectangle.Contains(button, x, y)) {
          touchData.control = `uiButton_${index}`;
        }
      });
    }
  }

  update() {
    const _currentTime = this.scene.time.now;
    const frameTouches = new Set();

    this.scene.input.manager.pointers.forEach(pointer => {
      if (pointer.isDown) {
        frameTouches.add(pointer.id);
      }
    });

    this.activeTouches.forEach((touchData, id) => {
      if (!frameTouches.has(id)) {
        this.activeTouches.delete(id);
      }
    });

    if (this.debugEnabled) {
      this.updateDebugVisualization();
    }
  }

  updateDebugVisualization() {
    this.debugGraphics.clear();

    this.debugGraphics.lineStyle(2, 0xffff00, 0.5);

    if (this.zones.gameField) {
      this.debugGraphics.strokeRect(
        this.zones.gameField.x,
        this.zones.gameField.y,
        this.zones.gameField.width,
        this.zones.gameField.height
      );
    }

    if (this.zones.towerSelector) {
      this.debugGraphics.strokeRect(
        this.zones.towerSelector.x,
        this.zones.towerSelector.y,
        this.zones.towerSelector.width,
        this.zones.towerSelector.height
      );
    }

    if (this.zones.uiButtons) {
      this.zones.uiButtons.forEach(button => {
        this.debugGraphics.strokeRect(button.x, button.y, button.width, button.height);
      });
    }

    this.debugGraphics.lineStyle(2, 0xff0000, 1);

    this.activeTouches.forEach((touchData, _id) => {
      this.debugGraphics.fillStyle(0xff0000, 0.5);
      this.debugGraphics.fillCircle(touchData.x, touchData.y, 20);

      this.debugGraphics.lineStyle(2, 0x00ff00, 1);
      this.debugGraphics.lineBetween(touchData.startX, touchData.startY, touchData.x, touchData.y);
    });

    const touchInfo = Array.from(this.activeTouches.entries()).map(
      ([_id, data]) =>
        `Touch ${_id}: (${Math.floor(data.x)},${Math.floor(data.y)}) ${data.control || 'none'}`
    );

    this.debugText.setText(['Touch Debug:', ...touchInfo]);
  }

  destroy() {
    this.scene.input.off('pointerdown', this.handleTouchStart, this);
    this.scene.input.off('pointermove', this.handleTouchMove, this);
    this.scene.input.off('pointerup', this.handleTouchEnd, this);
    this.scene.input.off('pointerupoutside', this.handleTouchEnd, this);

    if (this.debugEnabled) {
      this.debugGraphics.destroy();
      this.debugText.destroy();
    }
  }
}
