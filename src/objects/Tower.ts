import Phaser from 'phaser';
import { TOWERS, TowerType, TowerLevel } from '../config/towerConfig';

export class Tower extends Phaser.GameObjects.Container {
  private towerSprite: Phaser.GameObjects.Rectangle;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private range: number;
  private fireRate: number;
  private damage: number;
  private lastFired = 0;
  private level: TowerLevel = TowerLevel.LEVEL_1;
  private showRange = false;
  private towerType: TowerType;
  constructor(scene: Phaser.Scene, x: number, y: number, type: TowerType = TowerType.BASIC) {
    super(scene, x, y);

    this.towerType = type;

    const config = TOWERS[type].levels[TowerLevel.LEVEL_1];
    const color = config.color;
    this.range = config.range;
    this.fireRate = config.fireRate;
    this.damage = config.damage;

    this.towerSprite = new Phaser.GameObjects.Rectangle(scene, 0, 0, 32, 32, color);
    this.add(this.towerSprite);

    this.rangeCircle = scene.add.graphics();
    this.drawRange(false);
    this.add(this.rangeCircle);

    scene.add.existing(this);

    this.setInteractive(
      new Phaser.Geom.Rectangle(-16, -16, 32, 32),
      Phaser.Geom.Rectangle.Contains
    );

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

    const config = TOWERS[this.towerType].levels[this.level];
    this.range = config.range;
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.towerSprite.fillColor = config.color;

    this.drawRange(this.showRange);
    return true;
  }

  private getClosestEnemy(enemies: Phaser.GameObjects.Group): any {
    let closestEnemy = null;
    let closestDistance = this.range;

    enemies.getChildren().forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);

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

    const worldX = this.x;
    const worldY = this.y;

    bullet.x = worldX;
    bullet.y = worldY;

    const bulletConfig = TOWERS[this.towerType].bullet;
    const bulletColor = bulletConfig.color;
    const bulletSize = bulletConfig.size;
    const duration = bulletConfig.duration;

    bullet.fillStyle(bulletColor, 1);
    bullet.fillCircle(0, 0, bulletSize);

    const gameScene = this.scene as any;
    if (gameScene.addToGameField) {
      gameScene.addToGameField(bullet);
    }

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
