import Phaser from 'phaser';
import { TOWERS, TowerType, TowerLevel } from '../config/towerConfig';

export class Tower extends Phaser.GameObjects.Container {
  private towerSprite: Phaser.GameObjects.Rectangle;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private upgradeButton: Phaser.GameObjects.Container;
  private range: number;
  private fireRate: number;
  private damage: number;
  private lastFired = 0;
  private level: TowerLevel = TowerLevel.LEVEL_1;
  private showRange = false;
  private towerType: TowerType;
  private selected = false;
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
      if (!this.selected) {
        this.drawRange(false);
      }
    });

    this.on('pointerdown', () => {
      this.selectTower();
    });

    this.createUpgradeButton();
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

  private createUpgradeButton() {
    this.upgradeButton = this.scene.add.container(0, -40);
    this.upgradeButton.setVisible(false);
    this.add(this.upgradeButton);

    const nextLevel = this.level < TowerLevel.LEVEL_3 ? this.level + 1 : this.level;
    const upgradeCost = TOWERS[this.towerType].levels[nextLevel].upgradeCost || 0;

    const bg = this.scene.add.rectangle(0, 0, 70, 20, 0x333333, 0.8);
    bg.setStrokeStyle(1, 0xffffff);
    this.upgradeButton.add(bg);

    const text = this.scene.add.text(0, 0, `Upgrade: ${upgradeCost}`, {
      fontSize: '10px',
      color: '#ffffff'
    });
    text.setOrigin(0.5);
    this.upgradeButton.add(text);

    if (this.level < TowerLevel.LEVEL_3) {
      bg.setInteractive();
      bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.tryUpgrade();
      });
    } else {
      text.setText('Max Level');
    }
  }

  private selectTower() {
    this.selected = true;
    this.drawRange(true);
    this.upgradeButton.setVisible(true);

    // Deselect other towers
    const gameScene = this.scene as any;
    if (gameScene.towers) {
      gameScene.towers.getChildren().forEach((tower: Tower) => {
        if (tower !== this && tower.selected) {
          tower.deselectTower();
        }
      });
    }
  }

  public deselectTower() {
    this.selected = false;
    this.drawRange(false);
    this.upgradeButton.setVisible(false);
  }

  private tryUpgrade() {
    if (this.level === TowerLevel.LEVEL_3) {
      return false;
    }

    const nextLevel = this.level + 1;
    const upgradeCost = TOWERS[this.towerType].levels[nextLevel].upgradeCost || 0;
    
    const gameScene = this.scene as any;
    if (gameScene.gold >= upgradeCost) {
      gameScene.gold -= upgradeCost;
      gameScene.goldText.setText(`Gold: ${gameScene.gold}`);
      this.upgrade();
      return true;
    }
    
    return false;
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
    
    this.upgradeButton.removeAll(true);
    this.createUpgradeButton();
    
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
