import Phaser from 'phaser';
import { Tower, Enemy } from '../objects';
import { BG_COLOR, PATH_COLOR } from '../config';

export class GameScene extends Phaser.Scene {
  private towers: Phaser.GameObjects.Group;
  private enemies: Phaser.GameObjects.Group;
  private path: Phaser.Curves.Path;
  
  public gold: number = 100;
  private lives: number = 10;
  private wave: number = 0;
  
  public goldText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private nextWave: Phaser.Time.TimerEvent;

  constructor() {
    super('GameScene');
  }

  create() {
    console.log('Create function called');
    
    const bg = this.add.rectangle(400, 300, 800, 600, BG_COLOR);
    console.log('Background created');
    
    this.createPath();
    this.createUI();
    
    this.towers = this.add.group();
    this.enemies = this.add.group();
    
    this.events.on('enemyDefeated', (goldAmount: number) => {
      this.gold += goldAmount;
      this.goldText.setText(`Gold: ${this.gold}`);
    });
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gold >= 50) {
        this.placeTower(pointer.x, pointer.y);
      }
    });
    
    this.nextWave = this.time.addEvent({
      delay: 5000,
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
    this.path = new Phaser.Curves.Path(0, 300);
    this.path.lineTo(200, 300);
    this.path.lineTo(200, 150);
    this.path.lineTo(400, 150);
    this.path.lineTo(400, 450);
    this.path.lineTo(600, 450);
    this.path.lineTo(600, 300);
    this.path.lineTo(800, 300);
    
    const graphics = this.add.graphics();
    graphics.lineStyle(3, PATH_COLOR, 1);
    this.path.draw(graphics);
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

  private placeTower(x: number, y: number) {
    const tower = new Tower(this, x, y);
    this.towers.add(tower);
    this.gold -= 50;
    this.goldText.setText(`Gold: ${this.gold}`);
  }

  private startWave() {
    this.wave++;
    this.waveText.setText(`Wave: ${this.wave}`);
    
    const enemyCount = 5 + this.wave * 2;
    
    for (let i = 0; i < enemyCount; i++) {
      this.time.addEvent({
        delay: i * 1000,
        callback: () => {
          const enemy = new Enemy(this, this.path);
          this.enemies.add(enemy);
        },
        callbackScope: this
      });
    }
  }
}
