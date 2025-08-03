import * as Phaser from 'phaser';
import { Tower, Enemy, EnemyType, TowerType } from '../objects';
import { BG_COLOR, UI_PADDING, UI_ELEMENT_SPACING, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../config';
import { TileMap, TouchManager, TouchEvents, TouchZones } from '../systems';
import { TowerSelector } from '../ui';

export class GameScene extends Phaser.Scene {
  public addToGameField(gameObject: Phaser.GameObjects.GameObject): void {
    if (this.gameFieldContainer) {
      this.gameFieldContainer.add(gameObject);
    }
  }
  private towers: Phaser.GameObjects.Group;
  private enemies: Phaser.GameObjects.Group;
  private path: Phaser.Curves.Path;
  private tileMap: TileMap;
  private tileSize: number;
  private hoveredTile: { gridX: number; gridY: number } | null = null;
  private selectedTile: { gridX: number; gridY: number } | null = null;
  private towerSelector: TowerSelector;
  private background: Phaser.GameObjects.Rectangle;
  private selectedTileMarker: Phaser.GameObjects.Graphics;
  private touchManager: TouchManager;

  public gold = 200;
  private lives = 20;
  private wave = 0;

  public goldText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private nextWave: Phaser.Time.TimerEvent;
  private uiContainer: Phaser.GameObjects.Container;
  private gameWidth: number;
  private gameHeight: number;
  private gameArea: { width: number; height: number };
  private gameFieldContainer: Phaser.GameObjects.Container;
  private isDragging = false;
  private isPinching = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private currentScale = 1;
  private minScale = 0.5;
  private maxScale = 2;
  private zoomInButton: Phaser.GameObjects.Text;
  private zoomOutButton: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
    this.tileSize = 40; // Default value, will be recalculated
  }

  create() {
    this.gameWidth = DEFAULT_WIDTH;
    this.gameHeight = DEFAULT_HEIGHT;

    this.setupLayout();

    this.towers = this.add.group();
    this.enemies = this.add.group();

    this.selectedTileMarker = this.add.graphics();
    this.gameFieldContainer.add(this.selectedTileMarker);

    this.events.on('enemyDefeated', (goldAmount: number) => {
      this.gold += goldAmount;
      this.goldText.setText(`Gold: ${this.gold}`);
    });

    this.setupInputHandlers();
    this.setupTouchManager();

    this.nextWave = this.time.addEvent({
      delay: 10000,
      callback: this.startWave,
      callbackScope: this,
      loop: true
    });
  }

  private setupInputHandlers() {
    this.gameFieldContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;

      this.deselectAllTowers();
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;

        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;

        const newX = this.gameFieldContainer.x + dx;
        const newY = this.gameFieldContainer.y + dy;

        const towerSelectorHeight = 100;
        const visibleHeight = this.gameHeight - towerSelectorHeight;
        const _visibleWidth = this.gameWidth;

        const scaledWidth = this.gameArea.width * this.currentScale;
        const scaledHeight = this.gameArea.height * this.currentScale;

        const minX = Math.min(0, _visibleWidth - scaledWidth);
        const minY = Math.min(0, visibleHeight - scaledHeight);
        const maxX = 0;
        const maxY = 0;

        this.gameFieldContainer.x = Phaser.Math.Clamp(newX, minX, maxX);
        this.gameFieldContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
        return;
      }

      if (this.isPointerInGameArea(pointer)) {
        const fieldX = (pointer.x - this.gameFieldContainer.x) / this.currentScale;
        const fieldY = (pointer.y - this.gameFieldContainer.y) / this.currentScale;

        const { gridX, gridY } = this.tileMap.pixelToGrid(fieldX, fieldY);

        if (
          this.hoveredTile === null ||
          this.hoveredTile.gridX !== gridX ||
          this.hoveredTile.gridY !== gridY
        ) {
          this.hoveredTile = { gridX, gridY };
          this.tileMap.clearHighlight();
          const canPlace = this.tileMap.canPlaceTower(gridX, gridY);
          this.tileMap.highlightTile(gridX, gridY, canPlace);
        }
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const distance = Phaser.Math.Distance.Between(
          this.dragStartX,
          this.dragStartY,
          pointer.x,
          pointer.y
        );

        if (distance < 10 && this.isPointerInGameArea(pointer)) {
          const fieldX = (pointer.x - this.gameFieldContainer.x) / this.currentScale;
          const fieldY = (pointer.y - this.gameFieldContainer.y) / this.currentScale;

          const { gridX, gridY } = this.tileMap.pixelToGrid(fieldX, fieldY);

          if (this.tileMap.canPlaceTower(gridX, gridY)) {
            this.selectTile(gridX, gridY);
          } else {
            this.clearSelectedTile();
          }
        }

        this.isDragging = false;
      }
    });

    this.input.on('pointerout', () => {
      this.isDragging = false;
    });
  }

  private setupTouchManager() {
    this.touchManager = new TouchManager(this, true);

    const touchZones: TouchZones = {
      gameField: new Phaser.Geom.Rectangle(
        this.gameFieldContainer.x,
        this.gameFieldContainer.y,
        this.gameArea.width,
        this.gameArea.height
      )
    };

    if (this.towerSelector) {
      const gameHeight = this.scale.height;
      touchZones.towerSelector = new Phaser.Geom.Rectangle(
        UI_PADDING,
        gameHeight - 90,
        this.scale.width - UI_PADDING * 2,
        80
      );
    }

    console.log('Touch zones:', touchZones);

    this.touchManager.setTouchZones(touchZones);

    this.events.on(TouchEvents.DRAG_START, this.handleTouchDragStart, this);
    this.events.on(TouchEvents.DRAG_MOVE, this.handleTouchDragMove, this);
    this.events.on(TouchEvents.DRAG_END, this.handleTouchDragEnd, this);
    this.events.on(TouchEvents.TAP, this.handleTouchTap, this);
    this.events.on(TouchEvents.LONG_PRESS, this.handleTouchLongPress, this);
    this.events.on(TouchEvents.PINCH_START, this.handlePinchStart, this);
    this.events.on(TouchEvents.PINCH_MOVE, this.handlePinchMove, this);
    this.events.on(TouchEvents.PINCH_END, this.handlePinchEnd, this);
  }

  private handleTouchDragStart(data: any) {
    if (data.control === 'gameField' && !this.isPinching) {
      this.isDragging = true;
      this.dragStartX = data.x;
      this.dragStartY = data.y;
      this.deselectAllTowers();
    }
  }

  private handleTouchDragMove(data: any) {
    if (data.control === 'gameField' && this.isDragging) {
      const dx = data.deltaX;
      const dy = data.deltaY;

      const newX = this.gameFieldContainer.x + dx;
      const newY = this.gameFieldContainer.y + dy;

      const towerSelectorHeight = 100;
      const visibleHeight = this.gameHeight - towerSelectorHeight;
      const visibleWidth = this.gameWidth;

      const scaledWidth = this.gameArea.width * this.currentScale;
      const scaledHeight = this.gameArea.height * this.currentScale;

      const minX = Math.min(0, visibleWidth - scaledWidth);
      const minY = Math.min(0, visibleHeight - scaledHeight);
      const maxX = 0;
      const maxY = 0;

      this.gameFieldContainer.x = Phaser.Math.Clamp(newX, minX, maxX);
      this.gameFieldContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
    }
  }

  private handleTouchDragEnd(data: any) {
    if (data.control === 'gameField') {
      this.isDragging = false;
    }
  }

  private handleTouchTap(data: any) {
    console.log('Touch tap event:', data);

    if (data.control === 'gameField') {
      const towerSelectorHeight = 100;
      const visibleHeight = this.gameHeight - towerSelectorHeight;

      if (data.y < visibleHeight) {
        const fieldX = (data.x - this.gameFieldContainer.x) / this.currentScale;
        const fieldY = (data.y - this.gameFieldContainer.y) / this.currentScale;

        console.log('Field coordinates:', { fieldX, fieldY });

        const { gridX, gridY } = this.tileMap.pixelToGrid(fieldX, fieldY);
        console.log('Grid coordinates:', { gridX, gridY });

        if (this.tileMap.canPlaceTower(gridX, gridY)) {
          this.selectTile(gridX, gridY);
        } else {
          this.clearSelectedTile();
        }
      }
    }
  }

  private handleTouchLongPress(_data: any) {}

  private handlePinchStart(data: any) {
    console.log('Pinch start event received:', data);

    this.isPinching = true;

    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  private handlePinchMove(data: any) {
    console.log('Pinch move event received:', data);

    if (data.control === 'gameField' || !data.control) {
      const newScale = Phaser.Math.Clamp(
        this.currentScale * data.scaleFactor,
        this.minScale,
        this.maxScale
      );

      console.log(`Scaling from ${this.currentScale} to ${newScale}`);

      const scaleFactor = newScale / this.currentScale;

      if (scaleFactor !== 1) {
        const centerX = data.center.x;
        const centerY = data.center.y;

        const worldCenterX = (centerX - this.gameFieldContainer.x) / this.currentScale;
        const worldCenterY = (centerY - this.gameFieldContainer.y) / this.currentScale;

        this.gameFieldContainer.scale = newScale;

        const newWorldCenterX = worldCenterX * newScale;
        const newWorldCenterY = worldCenterY * newScale;

        const offsetX = newWorldCenterX - (centerX - this.gameFieldContainer.x);
        const offsetY = newWorldCenterY - (centerY - this.gameFieldContainer.y);

        this.gameFieldContainer.x -= offsetX;
        this.gameFieldContainer.y -= offsetY;

        this.currentScale = newScale;

        this.constrainGameField();

        if (typeof window !== 'undefined') {
          console.log('Dispatching game-scale-changed event');
          const canvas = this.game.canvas;
          const event = new CustomEvent('game-scale-changed', {
            bubbles: true,
            detail: { scale: newScale }
          });
          canvas.dispatchEvent(event);
        }
      }
    }
  }

  private handlePinchEnd(data: any) {
    console.log('Pinch end event received:', data);
    this.isPinching = false;
  }

  private constrainGameField() {
    const towerSelectorHeight = 100;
    const visibleHeight = this.gameHeight - towerSelectorHeight;
    const visibleWidth = this.gameWidth;

    const scaledWidth = this.gameArea.width * this.currentScale;
    const scaledHeight = this.gameArea.height * this.currentScale;

    const minX = Math.min(0, visibleWidth - scaledWidth);
    const minY = Math.min(0, visibleHeight - scaledHeight);
    const maxX = 0;
    const maxY = 0;

    this.gameFieldContainer.x = Phaser.Math.Clamp(this.gameFieldContainer.x, minX, maxX);
    this.gameFieldContainer.y = Phaser.Math.Clamp(this.gameFieldContainer.y, minY, maxY);
  }

  update(time: number) {
    this.enemies.getChildren().forEach((enemy: any) => {
      enemy.update();

      if (enemy.isAtEnd()) {
        this.lives--;
        this.livesText.setText(`Lives: ${this.lives}`);
        enemy.destroy();

        if (this.lives <= 0) {
          this.scene.restart();
        }
      }
    });

    this.towers.getChildren().forEach((tower: any) => {
      tower.update(time, this.enemies);
    });

    if (this.touchManager) {
      this.touchManager.update();
    }
  }

  private deselectAllTowers() {
    this.towers.getChildren().forEach((tower: any) => {
      if (tower.deselectTower) {
        tower.deselectTower();
      }
    });
  }

  private setupLayout() {
    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;

    this.background = this.add.rectangle(
      this.gameWidth / 2,
      this.gameHeight / 2,
      this.gameWidth,
      this.gameHeight,
      BG_COLOR
    );

    this.gameFieldContainer = this.add.container(0, 0);
    this.gameFieldContainer.scale = this.currentScale;

    this.calculateGameArea();

    this.gameFieldContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.gameArea.width, this.gameArea.height),
      Phaser.Geom.Rectangle.Contains
    );

    this.createTileMap();
    this.createPath();
    this.createUI();

    this.towerSelector = new TowerSelector(this, this.tileMap);
  }

  private calculateGameArea() {
    const pixelRatio = /* window.devicePixelRatio || */ 1;
    const physicalTileSize = 38;

    this.tileSize = Math.round(physicalTileSize * pixelRatio);
    this.tileSize = Math.max(20, this.tileSize);

    const gridWidth = 20;
    const gridHeight = 20;

    this.gameArea = {
      width: gridWidth * this.tileSize,
      height: gridHeight * this.tileSize
    };

    console.log(`Screen dimensions: ${this.gameWidth}x${this.gameHeight}`);
    console.log(`Device pixel ratio: ${pixelRatio}`);
    console.log(`Calculated tile size: ${this.tileSize}`);
    console.log(`Grid dimensions: ${gridWidth}x${gridHeight}`);
    console.log(`Game area dimensions: ${this.gameArea.width}x${this.gameArea.height}`);
  }

  private createTileMap() {
    this.tileMap = new TileMap(
      this,
      this.gameArea.width,
      this.gameArea.height,
      this.tileSize,
      this.gameFieldContainer
    );

    console.log(`TileMap created with dimensions: ${this.gameArea.width}x${this.gameArea.height}`);
  }

  private createPath() {
    const gridWidth = 20;
    const gridHeight = 20;

    const pathCoords = [
      [Math.floor(gridHeight / 2), 0],
      [Math.floor(gridHeight / 2), Math.floor(gridHeight / 3)],
      [Math.floor(gridHeight / 5), Math.floor(gridHeight / 3)],
      [Math.floor(gridHeight / 5), Math.floor((gridHeight * 2) / 3)],
      [Math.floor((gridHeight * 3) / 5), Math.floor((gridHeight * 2) / 3)],
      [Math.floor((gridHeight * 3) / 5), Math.floor(gridHeight / 2)],
      [gridWidth - 1, Math.floor(gridHeight / 2)]
    ];

    this.path = this.tileMap.createPath(pathCoords);
    this.tileMap.render();
  }

  private createUI() {
    this.uiContainer = this.add.container(UI_PADDING, UI_PADDING);

    this.goldText = this.add.text(0, 0, `Gold: ${this.gold}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.livesText = this.add.text(0, UI_ELEMENT_SPACING, `Lives: ${this.lives}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.waveText = this.add.text(0, UI_ELEMENT_SPACING * 2, `Wave: ${this.wave}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.uiContainer.add([this.goldText, this.livesText, this.waveText]);

    this.createZoomButtons();
  }

  private createZoomButtons() {
    const buttonStyle = {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#007700',
      padding: {
        x: 15,
        y: 10
      },
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    };

    this.zoomInButton = this.add
      .text(this.gameWidth - 80, 20, '+', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.zoomIn();
      });

    this.zoomOutButton = this.add
      .text(this.gameWidth - 80, 100, '-', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.zoomOut();
      });

    this.zoomInButton.setDepth(1000);
    this.zoomOutButton.setDepth(1000);

    this.add.existing(this.zoomInButton);
    this.add.existing(this.zoomOutButton);

    console.log('Zoom buttons created at:', {
      zoomIn: { x: this.zoomInButton.x, y: this.zoomInButton.y },
      zoomOut: { x: this.zoomOutButton.x, y: this.zoomOutButton.y }
    });
  }

  private zoomIn() {
    const newScale = Phaser.Math.Clamp(this.currentScale * 1.2, this.minScale, this.maxScale);
    this.setZoom(newScale);
  }

  private zoomOut() {
    const newScale = Phaser.Math.Clamp(this.currentScale * 0.8, this.minScale, this.maxScale);
    this.setZoom(newScale);
  }

  private setZoom(newScale: number) {
    console.log(`Setting zoom: ${this.currentScale} -> ${newScale}`);

    if (newScale !== this.currentScale) {
      const centerX = this.gameWidth / 2;
      const centerY = this.gameHeight / 2;

      const worldCenterX = (centerX - this.gameFieldContainer.x) / this.currentScale;
      const worldCenterY = (centerY - this.gameFieldContainer.y) / this.currentScale;

      this.gameFieldContainer.scale = newScale;

      const newWorldCenterX = worldCenterX * newScale;
      const newWorldCenterY = worldCenterY * newScale;

      const offsetX = newWorldCenterX - (centerX - this.gameFieldContainer.x);
      const offsetY = newWorldCenterY - (centerY - this.gameFieldContainer.y);

      this.gameFieldContainer.x -= offsetX;
      this.gameFieldContainer.y -= offsetY;

      this.currentScale = newScale;

      this.constrainGameField();

      if (typeof window !== 'undefined') {
        const canvas = this.game.canvas;
        const event = new CustomEvent('game-scale-changed', {
          bubbles: true,
          detail: { scale: newScale }
        });
        canvas.dispatchEvent(event);
      }
    }
  }

  private selectTile(gridX: number, gridY: number) {
    this.selectedTile = { gridX, gridY };
    this.drawSelectedTileMarker();

    this.towerSelector.setEnabled(true);
    this.towerSelector.clearSelection();
  }

  private clearSelectedTile() {
    this.selectedTile = null;
    this.selectedTileMarker.clear();

    this.towerSelector.setEnabled(false);
    this.towerSelector.clearSelection();
  }

  private drawSelectedTileMarker() {
    this.selectedTileMarker.clear();

    if (this.selectedTile) {
      const { x, y } = this.tileMap.gridToPixel(this.selectedTile.gridX, this.selectedTile.gridY);
      const halfTileSize = this.tileSize / 2;

      this.selectedTileMarker.lineStyle(3, 0xffff00, 1);
      this.selectedTileMarker.strokeRect(
        x - halfTileSize,
        y - halfTileSize,
        this.tileSize,
        this.tileSize
      );
    }
  }

  private placeTower(gridX: number, gridY: number, towerType: TowerType) {
    const cost = this.towerSelector.getTowerCost(towerType);

    if (this.tileMap.placeTower(gridX, gridY)) {
      const { x, y } = this.tileMap.gridToPixel(gridX, gridY);

      const tower = new Tower(this, x, y, towerType);
      this.towers.add(tower);
      this.gameFieldContainer.add(tower);

      this.gold -= cost;
      this.goldText.setText(`Gold: ${this.gold}`);
      this.tileMap.render();

      this.clearSelectedTile();
    }
  }

  private startWave() {
    this.wave++;
    this.waveText.setText(`Wave: ${this.wave}`);

    const enemyCount = 3 + this.wave;

    for (let i = 0; i < enemyCount; i++) {
      this.time.addEvent({
        delay: i * 1500,
        callback: () => {
          let enemyType = EnemyType.SCOUT_MOUSE;

          if (this.wave > 5) {
            if (i % 5 === 0) {
              enemyType = EnemyType.ARMORED_MOUSE;
            } else if (i % 2 === 0) {
              enemyType = EnemyType.SOLDIER_MOUSE;
            }
          } else if (this.wave > 3) {
            if (i % 3 === 0) {
              enemyType = EnemyType.SOLDIER_MOUSE;
            }
          }

          const enemy = new Enemy(this, this.path, enemyType);
          this.enemies.add(enemy);
          this.gameFieldContainer.add(enemy);
        },
        callbackScope: this
      });
    }
  }

  private resetGame() {
    this.towers.clear(true, true);
    this.enemies.clear(true, true);

    if (this.towerSelector) {
      this.towerSelector.destroy();
    }

    if (this.background) {
      this.background.destroy();
    }

    if (this.uiContainer) {
      this.uiContainer.destroy();
    }

    if (this.zoomInButton) {
      this.zoomInButton.destroy();
    }

    if (this.zoomOutButton) {
      this.zoomOutButton.destroy();
    }

    if (this.touchManager) {
      this.touchManager.destroy();

      this.events.off(TouchEvents.DRAG_START, this.handleTouchDragStart, this);
      this.events.off(TouchEvents.DRAG_MOVE, this.handleTouchDragMove, this);
      this.events.off(TouchEvents.DRAG_END, this.handleTouchDragEnd, this);
      this.events.off(TouchEvents.TAP, this.handleTouchTap, this);
      this.events.off(TouchEvents.LONG_PRESS, this.handleTouchLongPress, this);
      this.events.off(TouchEvents.PINCH_START, this.handlePinchStart, this);
      this.events.off(TouchEvents.PINCH_MOVE, this.handlePinchMove, this);
      this.events.off(TouchEvents.PINCH_END, this.handlePinchEnd, this);
    }

    this.setupLayout();
  }

  private isPointerInGameArea(pointer: Phaser.Input.Pointer): boolean {
    const towerSelectorHeight = 100;
    const visibleHeight = this.gameHeight - towerSelectorHeight;

    return pointer.y < visibleHeight;
  }
}
