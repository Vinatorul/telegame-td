import Phaser from 'phaser';
import { GameConfig, getOrientation, Orientation, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './config';
import { scenes } from './scenes';

let game: Phaser.Game;
export let currentOrientation: Orientation;

window.addEventListener('load', () => {
  console.log('Window loaded, initializing game...');
  
  let width = DEFAULT_WIDTH;
  let height = DEFAULT_HEIGHT;
  
  if (window.Telegram && window.Telegram.WebApp) {
    console.log('Telegram Web App detected');
    window.Telegram.WebApp.ready();
    
    const viewportHeight = window.Telegram.WebApp.viewportHeight;
    const viewportWidth = window.Telegram.WebApp.viewportStableWidth;
    
    console.log(`Telegram viewport: ${viewportWidth}x${viewportHeight}`);
    
    if (viewportHeight && viewportWidth) {
      width = viewportWidth;
      height = viewportHeight;
      console.log(`Game size adjusted to: ${width}x${height}`);
    }
  } else {
    console.log('Telegram Web App not detected, using default size');
    width = window.innerWidth;
    height = window.innerHeight;
  }
  
  currentOrientation = getOrientation(width, height);
  console.log(`Initial orientation: ${currentOrientation === Orientation.LANDSCAPE ? 'Landscape' : 'Portrait'}`);
  
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
    let newWidth, newHeight;
    
    if (window.Telegram && window.Telegram.WebApp) {
      newWidth = window.Telegram.WebApp.viewportStableWidth;
      newHeight = window.Telegram.WebApp.viewportHeight;
    } else {
      newWidth = window.innerWidth;
      newHeight = window.innerHeight;
    }
    
    console.log(`Window resized to: ${newWidth}x${newHeight}`);
    
    if (newWidth && newHeight) {
      const newOrientation = getOrientation(newWidth, newHeight);
      const orientationChanged = newOrientation !== currentOrientation;
      
      currentOrientation = newOrientation;
      console.log(`Orientation: ${currentOrientation === Orientation.LANDSCAPE ? 'Landscape' : 'Portrait'}`);
      
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
          console.log(`Emitting resize event to active scene`);
          activeScene.events.emit('resize', { width: newWidth, height: newHeight });
          
          if (orientationChanged) {
            console.log(`Emitting orientationchange event to active scene`);
            activeScene.events.emit('orientationchange', currentOrientation);
          }
        }
      }
    }
  };
  
  window.addEventListener('resize', handleResize);
});

export { game };
