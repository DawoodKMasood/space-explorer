import Phaser from 'phaser';
import { GameOverScene } from './scenes/gameOver.js'
import { GamePlayScene } from './scenes/gamePlay.js'

const config = {
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  audio: {
    disableWebAudio: true
  },
  scene: [ GamePlayScene, GameOverScene ],
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      gravity: {y : 0},
    }
  },
};

const game = new Phaser.Game(config);
