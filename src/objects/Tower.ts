import Phaser from 'phaser';
import { TOWER_COLOR } from '../config';

export class Tower extends Phaser.GameObjects.Rectangle {
  private range: number = 150;
  private fireRate: number = 1000;
  private damage: number = 20;
  private lastFired: number = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32, TOWER_COLOR);
    scene.add.existing(this);
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
  
  private fire(enemy: any) {
    if (!this.scene || !enemy) return;
    
    const bullet = this.scene.add.graphics();
    bullet.x = this.x;
    bullet.y = this.y;
    bullet.fillStyle(0xff0000, 1);
    bullet.fillCircle(0, 0, 5);
    
    if (this.scene.tweens) {
      const targetX = enemy.x;
      const targetY = enemy.y;

      this.scene.tweens.add({
        targets: bullet,
        x: targetX,
        y: targetY,
        duration: 200,
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
