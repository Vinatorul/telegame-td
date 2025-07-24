import Phaser from 'phaser';
import { TOWER_COLOR } from '../config';

export enum TowerLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3
}

export enum TowerType {
  BASIC = 'basic',
  ARCHER = 'archer',
  MAGE = 'mage'
}

export class Tower extends Phaser.GameObjects.Container {
  private towerSprite: Phaser.GameObjects.Rectangle;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private range: number = 150;
  private fireRate: number = 1000;
  private damage: number = 20;
  private lastFired: number = 0;
  private level: TowerLevel = TowerLevel.LEVEL_1;
  private showRange: boolean = false;
  private towerType: TowerType;
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: TowerType = TowerType.BASIC) {
    super(scene, x, y);
    
    this.towerType = type;
    
    let color = TOWER_COLOR;
    
    switch (type) {
      case TowerType.ARCHER:
        color = 0x2ecc71;
        this.range = 200;
        this.fireRate = 1200;
        this.damage = 15;
        break;
      case TowerType.MAGE:
        color = 0x9b59b6;
        this.range = 150;
        this.fireRate = 1500;
        this.damage = 30;
        break;
      default:
        color = TOWER_COLOR;
        this.range = 150;
        this.fireRate = 1000;
        this.damage = 20;
    }
    
    this.towerSprite = new Phaser.GameObjects.Rectangle(scene, 0, 0, 32, 32, color);
    this.add(this.towerSprite);
    
    this.rangeCircle = scene.add.graphics();
    this.drawRange(false);
    this.add(this.rangeCircle);
    
    scene.add.existing(this);
    
    this.setInteractive(new Phaser.Geom.Rectangle(-16, -16, 32, 32),
      Phaser.Geom.Rectangle.Contains);
      
    this.on('pointerover', () => {
      this.drawRange(true);
    });
    
    this.on('pointerout', () => {
      this.drawRange(false);
    });
  }
  
  update(time: number, enemies: Phaser.GameObjects.Group) {
    if (time > this.lastFired + this.fireRate) {
      const enemy = this.getClosestEnemy(enemies);
      
      if (enemy) {
        this.fire(enemy);
        this.lastFired = time;
      }
    }
  }
  
  upgrade(): boolean {
    if (this.level === TowerLevel.LEVEL_3) {
      return false;
    }
    
    this.level++;
    
    switch (this.level) {
      case TowerLevel.LEVEL_2:
        this.range += 50;
        this.damage += 10;
        this.fireRate -= 200;
        this.towerSprite.fillColor = 0x2980b9;
        break;
      case TowerLevel.LEVEL_3:
        this.range += 50;
        this.damage += 15;
        this.fireRate -= 200;
        this.towerSprite.fillColor = 0x1c4966;
        break;
    }
    
    this.drawRange(this.showRange);
    return true;
  }
  
  private getClosestEnemy(enemies: Phaser.GameObjects.Group): any {
    let closestEnemy = null;
    let closestDistance = this.range;
    
    enemies.getChildren().forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, enemy.x, enemy.y
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });
    
    return closestEnemy;
  }
  
  private drawRange(show: boolean) {
    this.showRange = show;
    this.rangeCircle.clear();
    
    if (show) {
      this.rangeCircle.lineStyle(1, 0xffffff, 0.3);
      this.rangeCircle.strokeCircle(0, 0, this.range);
    }
  }
  
  private fire(enemy: any) {
    if (!this.scene || !enemy) return;
    
    const bullet = this.scene.add.graphics();
    bullet.x = this.x;
    bullet.y = this.y;
    
    let bulletColor = 0xff0000;
    let bulletSize = 5;
    let duration = 200;
    
    switch (this.towerType) {
      case TowerType.ARCHER:
        bulletColor = 0x2ecc71;
        bulletSize = 3;
        duration = 150;
        break;
      case TowerType.MAGE:
        bulletColor = 0x9b59b6;
        bulletSize = 7;
        duration = 300;
        break;
      default:
        bulletColor = 0xff0000;
        bulletSize = 5;
        duration = 200;
    }
    
    bullet.fillStyle(bulletColor, 1);
    bullet.fillCircle(0, 0, bulletSize);
    
    if (this.scene.tweens) {
      const targetX = enemy.x;
      const targetY = enemy.y;

      this.scene.tweens.add({
        targets: bullet,
        x: targetX,
        y: targetY,
        duration: duration,
        onComplete: () => {
          if (enemy && typeof enemy.takeDamage === 'function' && !enemy.destroyed) {
            enemy.takeDamage(this.damage);
          }
          bullet.destroy();
        }
      });
    }
  }
}
