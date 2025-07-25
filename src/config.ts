import Phaser from 'phaser';

export const DEFAULT_WIDTH = 422;
export const DEFAULT_HEIGHT = 625;

export const UI_PADDING = 20;
export const UI_ELEMENT_SPACING = 30;

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  backgroundColor: '#444444',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  pixelArt: true
};

export const BG_COLOR = 0x444444;
export const PATH_COLOR = 0xffffff;
