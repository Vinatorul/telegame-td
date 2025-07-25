import Phaser from 'phaser';
import { TowerType } from '../objects';
import { TileMap } from '../systems';
import { UI_PADDING } from '../config';

export class TowerSelector {
  private scene: Phaser.Scene;
  private tileMap: TileMap;
  private selectedTowerType: string | null = null;
  private buttons: Phaser.GameObjects.Container;
  private towerButtons: Record<string, Phaser.GameObjects.Rectangle> = {};
  private towerCosts: Record<string, number> = {
    [TowerType.BASIC]: 50,
    [TowerType.ARCHER]: 75,
    [TowerType.MAGE]: 100
  };
  private enabled = false;
  private disabledOverlay: Phaser.GameObjects.Rectangle;
  constructor(scene: Phaser.Scene, tileMap: TileMap) {
    this.scene = scene;
    this.tileMap = tileMap;
    this.buttons = this.createButtons();
    
    const gameWidth = this.scene.scale.width;
    this.disabledOverlay = this.scene.add.rectangle(
      0,
      0,
      gameWidth - UI_PADDING * 2,
      80,
      0x000000,
      0.7
    );
    this.disabledOverlay.setOrigin(0, 0);
    this.buttons.add(this.disabledOverlay);
    
    this.setEnabled(false);
  }

  private createButtons(): Phaser.GameObjects.Container {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    const container = this.scene.add.container(UI_PADDING, gameHeight - 90);

    const bg = this.scene.add.rectangle(0, 0, gameWidth - UI_PADDING * 2, 80, 0x333333, 0.8);
    bg.setOrigin(0, 0);
    container.add(bg);

    const title = this.scene.add.text(10, 10, 'Towers', {
      fontSize: '18px',
      color: '#ffffff'
    });
    container.add(title);

    const buttonSize = 50;
    const padding = 10;
    const startX = 20;
    const startY = 40;

    const towerTypes = [
      { type: TowerType.BASIC, color: 0x3498db },
      { type: TowerType.ARCHER, color: 0x2ecc71 },
      { type: TowerType.MAGE, color: 0x9b59b6 }
    ];

    towerTypes.forEach((tower, index) => {
      const x = startX + index * (buttonSize + padding);
      const button = this.createTowerButton(x, startY, buttonSize, tower.type, tower.color);
      container.add(button);
    });

    return container;
  }

  private createTowerButton(
    x: number,
    y: number,
    size: number,
    towerType: string,
    color: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const button = this.scene.add.rectangle(0, 0, size, size, color);
    button.setInteractive();
    button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled) return;
      
      this.selectTowerType(towerType);
      
      const gameScene = this.scene as any;
      if (gameScene.selectedTile && gameScene.gold >= this.towerCosts[towerType]) {
        const { gridX, gridY } = gameScene.selectedTile;
        gameScene.placeTower(gridX, gridY, towerType);
      }
      
      pointer.event.stopPropagation();
    });
    container.add(button);

    this.towerButtons[towerType] = button;

    const costText = `${this.towerCosts[towerType]}`;
    const cost = this.scene.add.text(0, size / 2 + 5, costText, {
      fontSize: '12px',
      color: '#ffffff'
    });
    cost.setOrigin(0.5, 0);
    container.add(cost);

    return container;
  }

  public selectTowerType(towerType: string): void {
    Object.keys(this.towerButtons).forEach(type => {
      this.towerButtons[type].setStrokeStyle(0);
    });

    if (this.towerButtons[towerType]) {
      this.towerButtons[towerType].setStrokeStyle(3, 0xffff00);
    }

    this.selectedTowerType = towerType;
  }

  public getSelectedTowerType(): string | null {
    return this.selectedTowerType;
  }

  public clearSelection(): void {
    Object.keys(this.towerButtons).forEach(type => {
      this.towerButtons[type].setStrokeStyle(0);
    });

    this.selectedTowerType = null;
  }

  public getTowerCost(towerType: string): number {
    return this.towerCosts[towerType] || 50;
  }

  public destroy(): void {
    if (this.buttons) {
      this.buttons.destroy();
    }
  }
  
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.disabledOverlay.setVisible(!enabled);
    
    Object.values(this.towerButtons).forEach(button => {
      button.disableInteractive();
      if (enabled) {
        button.setInteractive();
      }
    });
  }
}
