import * as Phaser from 'phaser';
import { GameConfig, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './config';
import { scenes } from './scenes';

let game: Phaser.Game;

window.addEventListener('load', () => {
  console.log('Window loaded, initializing game...');

  let width = DEFAULT_WIDTH;
  let height = DEFAULT_HEIGHT;

  width = window.innerWidth;
  height = window.innerHeight;
  console.log(`Game size adjusted to: ${width}x${height}`);

  GameConfig.width = width;
  GameConfig.height = height;
  GameConfig.scale.width = width;
  GameConfig.scale.height = height;

  console.log('Creating Phaser game with config:', GameConfig);
  game = new Phaser.Game({
    ...GameConfig,
    scene: scenes
  });
  console.log('Phaser game created');

  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    console.log(`Window resized to: ${newWidth}x${newHeight}`);

    if (newWidth && newHeight) {
      // Force game scale to match window size
      GameConfig.width = newWidth;
      GameConfig.height = newHeight;
      GameConfig.scale.width = newWidth;
      GameConfig.scale.height = newHeight;

      console.log(`Resizing game to: ${newWidth}x${newHeight}`);
      game.scale.resize(newWidth, newHeight);

      if (game.scene.getScenes(true).length > 0) {
        const activeScene = game.scene.getScenes(true)[0];
        if (activeScene.events) {
          console.log('Emitting resize event to active scene');
          activeScene.events.emit('resize', { width: newWidth, height: newHeight });
        }
      }
    }
  };

  window.addEventListener('resize', handleResize);
});

export { game };
