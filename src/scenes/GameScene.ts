import Phaser from 'phaser';
import { Tower, Enemy, EnemyType, TowerType } from '../objects';
import { BG_COLOR, PATH_COLOR } from '../config';
import { TileMap, TileType } from '../systems';
import { TowerSelector } from '../ui';

export class GameScene extends Phaser.Scene {
  private towers: Phaser.GameObjects.Group;
  private enemies: Phaser.GameObjects.Group;
  private path: Phaser.Curves.Path;
  private tileMap: TileMap;
  private tileSize: number = 40;
  private hoveredTile: { gridX: number, gridY: number } | null = null;
  private towerSelector: TowerSelector;
  
  public gold: number = 200;
  private lives: number = 20;
  private wave: number = 0;
  
  public goldText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private nextWave: Phaser.Time.TimerEvent;

  constructor() {
    super('GameScene');
  }

  create() {
    const bg = this.add.rectangle(400, 300, 800, 600, BG_COLOR);
    
    this.tileMap = new TileMap(this, 800, 600, this.tileSize);
    this.createPath();
    this.createUI();
    
    this.towerSelector = new TowerSelector(this, this.tileMap);
    
    this.towers = this.add.group();
    this.enemies = this.add.group();
    
    this.events.on('enemyDefeated', (goldAmount: number) => {
      this.gold += goldAmount;
      this.goldText.setText(`Gold: ${this.gold}`);
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const { gridX, gridY } = this.tileMap.pixelToGrid(pointer.x, pointer.y);
      
      if (this.hoveredTile === null ||
          this.hoveredTile.gridX !== gridX ||
          this.hoveredTile.gridY !== gridY) {
        this.hoveredTile = { gridX, gridY };
        this.tileMap.clearHighlight();
        const canPlace = this.tileMap.canPlaceTower(gridX, gridY);
        this.tileMap.highlightTile(gridX, gridY, canPlace);
      }
    });
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 480) {
        const { gridX, gridY } = this.tileMap.pixelToGrid(pointer.x, pointer.y);
        
        const selectedTowerType = this.towerSelector.getSelectedTowerType();
        if (selectedTowerType && this.tileMap.canPlaceTower(gridX, gridY)) {
          const cost = this.towerSelector.getTowerCost(selectedTowerType);
          if (this.gold >= cost) {
            this.placeTower(gridX, gridY);
          }
        }
      }
    });
    
    this.nextWave = this.time.addEvent({
      delay: 10000,
      callback: this.startWave,
      callbackScope: this,
      loop: true
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

  private createPath() {
    const pathCoords = [
      [7, 0],  // Start at left edge, middle
      [7, 5],  // Right to first turn
      [3, 5],  // Up to second turn
      [3, 10], // Down to third turn
      [11, 10], // Right to fourth turn
      [11, 7],  // Up to fifth turn
      [19, 7]   // Right to exit
    ];
    
    this.path = this.tileMap.createPath(pathCoords);
    this.tileMap.render();
  }

  private createUI() {
    this.goldText = this.add.text(20, 20, `Gold: ${this.gold}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    this.livesText = this.add.text(20, 50, `Lives: ${this.lives}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    this.waveText = this.add.text(20, 80, `Wave: ${this.wave}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
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
        },
        callbackScope: this
      });
    }
  }
}
