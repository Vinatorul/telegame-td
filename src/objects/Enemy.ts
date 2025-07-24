import Phaser from 'phaser';
import { ENEMY_COLOR } from '../config';

export enum EnemyType {
  SCOUT_MOUSE = 'scout',
  SOLDIER_MOUSE = 'soldier',
  ARMORED_MOUSE = 'armored'
}

interface EnemyStats {
  health: number;
  speed: number;
  reward: number;
}

export class Enemy extends Phaser.GameObjects.Container {
  private enemySprite: Phaser.GameObjects.Arc;
  private path: Phaser.Curves.Path;
  private follower: { t: number; vec: Phaser.Math.Vector2 };
  private health: number;
  private maxHealth: number;
  private speed: number;
  private reward: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private enemyType: EnemyType;
  public destroyed: boolean = false;
  
  constructor(scene: Phaser.Scene, path: Phaser.Curves.Path, enemyType: EnemyType = EnemyType.SCOUT_MOUSE) {
    const vec = new Phaser.Math.Vector2();
    path.getPoint(0, vec);
    
    super(scene, vec.x, vec.y);
    
    this.enemyType = enemyType;
    const stats = this.getEnemyStats(enemyType);
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.reward = stats.reward;
    
    let radius = 15;
    let color = ENEMY_COLOR;
    
    switch (enemyType) {
      case EnemyType.SCOUT_MOUSE:
        radius = 12;
        color = 0xe74c3c;
        break;
      case EnemyType.SOLDIER_MOUSE:
        radius = 15;
        color = 0xf39c12;
        break;
      case EnemyType.ARMORED_MOUSE:
        radius = 18;
        color = 0x7f8c8d;
        break;
      default:
        radius = 15;
        color = ENEMY_COLOR;
    }
    
    this.enemySprite = new Phaser.GameObjects.Arc(scene, 0, 0, radius, 0, 360, false, color);
    this.add(this.enemySprite);
    
    this.path = path;
    this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();
    
    scene.add.existing(this);
  }
  
  private getEnemyStats(type: EnemyType): EnemyStats {
    switch (type) {
      case EnemyType.SCOUT_MOUSE:
        return {
          health: 50,
          speed: 0.0015,
          reward: 10
        };
      case EnemyType.SOLDIER_MOUSE:
        return {
          health: 100,
          speed: 0.001,
          reward: 20
        };
      case EnemyType.ARMORED_MOUSE:
        return {
          health: 200,
          speed: 0.0007,
          reward: 30
        };
      default:
        return {
          health: 100,
          speed: 0.001,
          reward: 20
        };
    }
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
  
  setPath(newPath: Phaser.Curves.Path) {
    this.path = newPath;
  }
  
  takeDamage(amount: number) {
    this.health -= amount;
    this.updateHealthBar();
    
    if (this.health <= 0) {
      if (this.scene && this.scene.events) {
        this.scene.events.emit('enemyDefeated', this.reward);
      }
      this.destroy();
    }
  }
  
  isAtEnd(): boolean {
    return this.follower.t >= 1;
  }
  
  private updateHealthBar() {
    this.healthBar.clear();
    
    let radius = 15;
    
    switch (this.enemyType) {
      case EnemyType.SCOUT_MOUSE:
        radius = 12;
        break;
      case EnemyType.SOLDIER_MOUSE:
        radius = 15;
        break;
      case EnemyType.ARMORED_MOUSE:
        radius = 18;
        break;
      default:
        radius = 15;
    }
    
    const width = 40;
    const height = 5;
    const x = -width / 2;
    const y = -(radius + 10);
    
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
    super.destroy();
  }
}
