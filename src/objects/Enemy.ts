import Phaser from 'phaser';
import { ENEMY_COLOR } from '../config';

export class Enemy extends Phaser.GameObjects.Arc {
  private path: Phaser.Curves.Path;
  private follower: { t: number; vec: Phaser.Math.Vector2 };
  private health: number = 100;
  private maxHealth: number = 100;
  private speed: number = 0.001;
  private healthBar: Phaser.GameObjects.Graphics;
  public destroyed: boolean = false;
  
  constructor(scene: Phaser.Scene, path: Phaser.Curves.Path) {
    const vec = new Phaser.Math.Vector2();
    path.getPoint(0, vec);
    
    super(scene, vec.x, vec.y, 15, 0, 360, false, ENEMY_COLOR);
    scene.add.existing(this);
    
    this.path = path;
    this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }
  
  update() {
    this.follower.t += this.speed;
    
    this.path.getPoint(this.follower.t, this.follower.vec);
    
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
    this.updateHealthBar();
    
    if (this.follower.t >= 1) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
  
  takeDamage(amount: number) {
    this.health -= amount;
    this.updateHealthBar();
    
    if (this.health <= 0) {
      // Check if scene exists before emitting event
      if (this.scene && this.scene.events) {
        this.scene.events.emit('enemyDefeated', 25);
      }
      this.destroy();
    }
  }
  
  isAtEnd(): boolean {
    return this.follower.t >= 1;
  }
  
  private updateHealthBar() {
    this.healthBar.clear();
    
    const width = 40;
    const height = 5;
    const x = this.x - width / 2;
    const y = this.y - this.height / 2 - 10;
    
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(x, y, width, height);
    
    const healthPercentage = this.health / this.maxHealth;
    const healthWidth = Math.floor(width * healthPercentage);
    
    if (healthPercentage > 0.6) {
      this.healthBar.fillStyle(0x00ff00, 1);
    } else if (healthPercentage > 0.3) {
      this.healthBar.fillStyle(0xffff00, 1);
    } else {
      this.healthBar.fillStyle(0xff0000, 1);
    }
    
    this.healthBar.fillRect(x, y, healthWidth, height);
  }
  
  destroy() {
    this.destroyed = true;
    this.healthBar.destroy();
    super.destroy();
  }
}
