import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    console.log('Preload function called');
    
    const loadingBar = this.add.graphics();
    const loadingBox = this.add.graphics();
    
    loadingBox.fillStyle(0x222222, 0.8);
    loadingBox.fillRect(240, 270, 320, 50);
    
    this.load.on('progress', (value: number) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      loadingBar.destroy();
      loadingBox.destroy();
    });
  }

  create() {
    console.log('BootScene create function called');
    this.scene.start('GameScene');
  }
}
