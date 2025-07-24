import Phaser from 'phaser';
import { Tower, Enemy, EnemyType, TowerType } from '../objects';
import { BG_COLOR, PATH_COLOR, Orientation, UI_PADDING, UI_ELEMENT_SPACING, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../config';
import { TileMap, TileType } from '../systems';
import { TowerSelector } from '../ui';
import { currentOrientation } from '../game';

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
  private hoveredTile: { gridX: number, gridY: number } | null = null;
  private towerSelector: TowerSelector;
  private background: Phaser.GameObjects.Rectangle;
  
  public gold: number = 200;
  private lives: number = 20;
  private wave: number = 0;
  
  public goldText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private nextWave: Phaser.Time.TimerEvent;
  private uiContainer: Phaser.GameObjects.Container;
  private gameWidth: number;
  private gameHeight: number;
  private gameArea: { width: number, height: number };
  private gameFieldContainer: Phaser.GameObjects.Container;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor() {
    super('GameScene');
    this.tileSize = 40; // Default value, will be recalculated
  }

  create() {
    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;
    
    this.setupLayout();
    
    this.towers = this.add.group();
    this.enemies = this.add.group();
    
    this.events.on('enemyDefeated', (goldAmount: number) => {
      this.gold += goldAmount;
      this.goldText.setText(`Gold: ${this.gold}`);
    });
    
    this.setupInputHandlers();
    
    this.nextWave = this.time.addEvent({
      delay: 10000,
      callback: this.startWave,
      callbackScope: this,
      loop: true
    });
    
    this.events.on('orientationchange', this.handleOrientationChange, this);
    this.events.on('resize', this.handleResize, this);
    this.scale.on('resize', this.handleResize, this);
  }
  
  private setupInputHandlers() {
    this.gameFieldContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        
        const newX = this.gameFieldContainer.x + dx;
        const newY = this.gameFieldContainer.y + dy;
        
        let visibleWidth, visibleHeight;
        
        if (currentOrientation === Orientation.LANDSCAPE) {
          const towerSelectorHeight = 100;
          visibleHeight = this.gameHeight - towerSelectorHeight;
          visibleWidth = this.gameWidth;
        } else {
          const towerSelectorWidth = 100;
          visibleWidth = this.gameWidth - towerSelectorWidth;
          visibleHeight = this.gameHeight;
        }
        
        const minX = Math.min(0, visibleWidth - this.gameArea.width);
        const minY = Math.min(0, visibleHeight - this.gameArea.height);
        const maxX = 0;
        const maxY = 0;
        
        this.gameFieldContainer.x = Phaser.Math.Clamp(newX, minX, maxX);
        this.gameFieldContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
        return;
      }
      
      if (this.isPointerInGameArea(pointer)) {
        const fieldX = pointer.x - this.gameFieldContainer.x;
        const fieldY = pointer.y - this.gameFieldContainer.y;
        
        const { gridX, gridY } = this.tileMap.pixelToGrid(fieldX, fieldY);
        
        if (this.hoveredTile === null ||
            this.hoveredTile.gridX !== gridX ||
            this.hoveredTile.gridY !== gridY) {
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
          this.dragStartX, this.dragStartY, pointer.x, pointer.y
        );
        
        if (distance < 10 && this.isPointerInGameArea(pointer)) {
          const fieldX = pointer.x - this.gameFieldContainer.x;
          const fieldY = pointer.y - this.gameFieldContainer.y;
          
          const { gridX, gridY } = this.tileMap.pixelToGrid(fieldX, fieldY);
          
          const selectedTowerType = this.towerSelector.getSelectedTowerType();
          if (selectedTowerType && this.tileMap.canPlaceTower(gridX, gridY)) {
            const cost = this.towerSelector.getTowerCost(selectedTowerType);
            if (this.gold >= cost) {
              this.placeTower(gridX, gridY);
            }
          }
        }
        
        this.isDragging = false;
      }
    });
    
    this.input.on('pointerout', () => {
      this.isDragging = false;
    });
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
    
    this.calculateGameArea();
    
    this.gameFieldContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.gameArea.width, this.gameArea.height), Phaser.Geom.Rectangle.Contains);
    
    this.createTileMap();
    this.createPath();
    this.createUI();
    
    this.towerSelector = new TowerSelector(
      this,
      this.tileMap,
      currentOrientation
    );
  }
  
  private calculateGameArea() {
    const fixedGridWidth = 20;
    const fixedGridHeight = 15;
    
    const maxTileWidth = Math.floor(this.gameWidth / fixedGridWidth);
    const maxTileHeight = Math.floor(this.gameHeight / fixedGridHeight);
    
    this.tileSize = Math.min(maxTileWidth, maxTileHeight);
    
    this.tileSize = Math.max(20, this.tileSize);
    
    const fixedWidth = fixedGridWidth * this.tileSize;
    const fixedHeight = fixedGridHeight * this.tileSize;
    
    this.gameArea = {
      width: fixedWidth,
      height: fixedHeight
    };
    
    console.log(`Screen dimensions: ${this.gameWidth}x${this.gameHeight}`);
    console.log(`Calculated tile size: ${this.tileSize}`);
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
    let pathCoords;
    
    if (currentOrientation === Orientation.LANDSCAPE) {
      const gridWidth = Math.floor(this.gameArea.width / this.tileSize);
      const gridHeight = Math.floor(this.gameArea.height / this.tileSize);
      
      pathCoords = [
        [Math.floor(gridHeight / 2), 0],
        [Math.floor(gridHeight / 2), Math.floor(gridHeight / 3)],
        [Math.floor(gridHeight / 5), Math.floor(gridHeight / 3)],
        [Math.floor(gridHeight / 5), Math.floor(gridHeight * 2 / 3)],
        [Math.floor(gridHeight * 3 / 5), Math.floor(gridHeight * 2 / 3)],
        [Math.floor(gridHeight * 3 / 5), Math.floor(gridHeight / 2)],
        [gridWidth - 1, Math.floor(gridHeight / 2)]
      ];
    } else {
      const gridWidth = Math.floor(this.gameArea.width / this.tileSize);
      const gridHeight = Math.floor(this.gameArea.height / this.tileSize);
      
      pathCoords = [
        [0, Math.floor(gridWidth / 2)],
        [Math.floor(gridHeight / 4), Math.floor(gridWidth / 2)],
        [Math.floor(gridHeight / 4), Math.floor(gridWidth / 4)],
        [Math.floor(gridHeight / 2), Math.floor(gridWidth / 4)],
        [Math.floor(gridHeight / 2), Math.floor(gridWidth * 3 / 4)],
        [Math.floor(gridHeight * 3 / 4), Math.floor(gridWidth * 3 / 4)],
        [Math.floor(gridHeight * 3 / 4), Math.floor(gridWidth / 2)],
        [gridHeight - 1, Math.floor(gridWidth / 2)]
      ];
    }
    
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
  }

  private placeTower(gridX: number, gridY: number) {
    const selectedTowerType = this.towerSelector.getSelectedTowerType();
    if (!selectedTowerType) return;
    
    const cost = this.towerSelector.getTowerCost(selectedTowerType);
    
    if (this.tileMap.placeTower(gridX, gridY)) {
      const { x, y } = this.tileMap.gridToPixel(gridX, gridY);
      
      let towerType = selectedTowerType as TowerType;
      
      const tower = new Tower(this, x, y, towerType);
      this.towers.add(tower);
      this.gameFieldContainer.add(tower);
      
      this.gold -= cost;
      this.goldText.setText(`Gold: ${this.gold}`);
      this.tileMap.render();
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
  
  private handleOrientationChange(orientation: Orientation) {
    this.updateLayout();
  }
  
  private handleResize(gameSize: any) {
    if (gameSize.width !== undefined && gameSize.height !== undefined) {
      this.gameWidth = gameSize.width;
      this.gameHeight = gameSize.height;
      
      console.log(`Game resized to: ${this.gameWidth}x${this.gameHeight}`);
      this.updateLayout();
    }
  }
  
  private updateLayout() {
    if (this.background) {
      this.background.setPosition(this.gameWidth / 2, this.gameHeight / 2);
      this.background.setSize(this.gameWidth, this.gameHeight);
    }
    
    if (this.gameFieldContainer) {
      this.gameFieldContainer.setPosition(0, 0);
    }
    
    this.calculateGameArea();
    
    if (this.gameFieldContainer) {
      let visibleWidth, visibleHeight;
      
      if (currentOrientation === Orientation.LANDSCAPE) {
        const towerSelectorHeight = 100;
        visibleHeight = this.gameHeight - towerSelectorHeight;
        visibleWidth = this.gameWidth;
      } else {
        const towerSelectorWidth = 100;
        visibleWidth = this.gameWidth - towerSelectorWidth;
        visibleHeight = this.gameHeight;
      }
      
      this.gameFieldContainer.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, visibleWidth, visibleHeight),
        Phaser.Geom.Rectangle.Contains
      );
    }
    
    if (this.tileMap) {
      this.tileMap.resize(this.gameArea.width, this.gameArea.height);
      
      this.createPath();
      this.tileMap.render();
      
      if (this.path && this.enemies) {
        this.enemies.getChildren().forEach((enemy: any) => {
          if (enemy.setPath) {
            enemy.setPath(this.path);
          }
        });
      }
    }
    
    if (this.towerSelector) {
      this.towerSelector.destroy();
      this.towerSelector = new TowerSelector(
        this,
        this.tileMap,
        currentOrientation
      );
    }
    
    if (this.uiContainer) {
      this.uiContainer.setPosition(UI_PADDING, UI_PADDING);
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
    
    this.setupLayout();
  }
  
  private isPointerInGameArea(pointer: Phaser.Input.Pointer): boolean {
    let visibleWidth, visibleHeight;
    
    if (currentOrientation === Orientation.LANDSCAPE) {
      const towerSelectorHeight = 100;
      visibleHeight = this.gameHeight - towerSelectorHeight;
      visibleWidth = this.gameWidth;
      
      return pointer.y < visibleHeight;
    } else {
      const towerSelectorWidth = 100;
      visibleWidth = this.gameWidth - towerSelectorWidth;
      visibleHeight = this.gameHeight;
      
      return pointer.x < visibleWidth;
    }
  }
}
