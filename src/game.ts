import Phaser from 'phaser';
import { GameConfig } from './config';
import { scenes } from './scenes';

window.addEventListener('load', () => {
  console.log('Window loaded, initializing game...');
  
  if (window.Telegram && window.Telegram.WebApp) {
    console.log('Telegram Web App detected');
    window.Telegram.WebApp.ready();
    
    const viewportHeight = window.Telegram.WebApp.viewportHeight;
    const viewportWidth = window.Telegram.WebApp.viewportStableWidth;
    
    console.log(`Telegram viewport: ${viewportWidth}x${viewportHeight}`);
    
    if (viewportHeight && viewportWidth) {
      GameConfig.width = viewportWidth;
      GameConfig.height = viewportHeight;
      console.log(`Game size adjusted to: ${viewportWidth}x${viewportHeight}`);
    }
  } else {
    console.log('Telegram Web App not detected, using default size');
  }
  
  console.log('Creating Phaser game with config:', GameConfig);
  const game = new Phaser.Game({
    ...GameConfig,
    scene: scenes
  });
  console.log('Phaser game created');
  
  window.addEventListener('resize', () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const viewportHeight = window.Telegram.WebApp.viewportHeight;
      const viewportWidth = window.Telegram.WebApp.viewportStableWidth;
      
      if (viewportHeight && viewportWidth) {
        game.scale.resize(viewportWidth, viewportHeight);
      }
    }
  });
});
