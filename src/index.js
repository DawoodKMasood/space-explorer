import Phaser from 'phaser';
import { playerId, playerShip, playerHealth, fireRate } from './consts/currentPlayerVariable.js'
import { otherPlayers } from './consts/otherPlayersVariable.js'
import { addPlayer, addOtherPlayers, updateHealthBar } from './logics/player.js'
import { mouseX, mouseY } from './consts/systemVariables.js'
import { healthBarGraphics, healthBarTextGraphics, playerCoordinatesTextGraphics, bulletsGroup, isFiring } from './consts/gameVariables.js';
import { Bullet } from './logics/bullet.js';

const config = {
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  audio: {
    disableWebAudio: true
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      gravity: {y : 0},
    }
  },
};

const game = new Phaser.Game(config);

var backgrounds = [];

function preload ()
{
  this.load.spritesheet('bullet_spritesheet', 'objects/bullets/shot_spritesheet.png', { frameWidth: 32, frameHeight: 32, } );
  this.load.spritesheet('bullet_explosion_spritesheet', 'objects/bullets/shot_explosion_spritesheet.png', { frameWidth: 32, frameHeight: 32, } );
  
  this.load.setBaseURL('http://localhost:8080');
  this.load.image('back', 'background/back.png');
  this.load.image('warrior1', 'objects/ships/warrior1.png');
  this.load.image('smoke', 'objects/smokes/explosion00.png');

  this.load.bitmapFont('nokia16', 'fonts/nokia16.png', 'fonts/nokia16.xml');
}

function create ()
{
    this.physics.world.setBounds(0, 0, 2048, 2048);
    this.cameras.main.setBounds(0, 0, 2048, 2048);
    bulletsGroup = this.physics.add.group();

    // Create an animation for the bullet
    this.anims.create({
      key: 'bullet',
      frames: 'bullet_spritesheet',
      frameRate: 4, // Adjust the frame rate as needed
      repeat: -1 // Set to -1 for infinite looping, or you can use a different number for a finite loop
    });

    // Create an animation for the bullet
    this.anims.create({
      key: 'bullet_explosion',
      frames: 'bullet_explosion_spritesheet',
      frameRate: 5, // Adjust the frame rate as needed
      repeat: 1 // Set to -1 for infinite looping, or you can use a different number for a finite loop
    });

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const background = this.add.image(i * 800, j * 600, 'back');
        background.setDepth(0);
        backgrounds.push(background);
      }
    }

    var self = this;
    this.socket = io();
    otherPlayers = this.physics.add.group();

    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });

    this.socket.on('newPlayer', function (playerInfo) {
      addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
      otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    
    this.socket.on('playerMoved', function (playerInfo) {
      otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    const sceneContext = this;
    
    this.socket.on('bulletFired', function (bulletInfo) {
      // Create a bullet at the player's position
      const bullet = new Bullet(sceneContext, bulletInfo.x, bulletInfo.y, bulletInfo.rotation, bulletInfo.bulletByPlayer);

      // Set the bullet's rotation to match the player's rotation
      bullet.setRotation(bulletInfo.rotation);

      // Add the bullet to the bullets group
      bulletsGroup.add(bullet);
    });

    this.socket.on('playerDisconnected', function (playerInfo) {
      otherPlayers.getChildren().forEach(function (otherPlayer) {
        // Assuming playerInfo contains the ID of the disconnected player
        if (otherPlayer.playerID === playerInfo.id) {
          // Remove the disconnected player from the collection
          otherPlayers.remove(otherPlayer, true, true);
        }
      });
    });

    // Create a health bar background
    var healthBarBackground = this.add.graphics();
    healthBarBackground.fillStyle(0xffffff, 0.5); // Black with 50% opacity
    healthBarBackground.fillRect(10, 35, 170, 15);
    healthBarBackground.setScrollFactor(0)

    // Create the actual health bar that will change based on ship's health
    healthBarGraphics = this.add.graphics();

    playerCoordinatesTextGraphics = this.add.bitmapText(10, 10, 'nokia16').setScrollFactor(0).setDepth(2);
    healthBarTextGraphics = this.add.bitmapText(190, 35, 'nokia16').setScrollFactor(0).setDepth(2);
}

function update() {

  // Check if the left mouse button is down
  if (this.input.activePointer.leftButtonDown()) {
    // If not already firing, start firing
    if (!isFiring) {
      isFiring = true;
      this.lastFired = 0; // Reset the lastFired timestamp to allow immediate firing
    }
  } else {
    // If the left mouse button is released, stop firing
    isFiring = false;
  }

  

  if (isFiring) {
    // Check if enough time has passed since the last shot
    if (!this.lastFired || this.time.now - this.lastFired >= fireRate) {
      // Create a bullet at the player's position
      const bullet = new Bullet(this, playerShip.x, playerShip.y, playerShip.rotation, playerId);

      // Set the bullet's rotation to match the player's rotation
      bullet.setRotation(playerShip.rotation);

      // Add the bullet to the bullets group
      bulletsGroup.add(bullet);

      // Update the last fired timestamp
      this.lastFired = this.time.now;

      this.socket.emit('bullet', { x: playerShip.x, y: playerShip.y, bulletByPlayer: playerId, rotation: playerShip.rotation });
    }
  }

  if (bulletsGroup) {
    // Update bullet logic
    bulletsGroup.children.iterate((bullet) => {
      if (bullet) {
        bullet.update();
      } 
    });
  }

  if ( playerShip !== undefined) {
    // emit player movement
    var x = playerShip.x;
    var y = playerShip.y;
    var r = playerShip.rotation;
    if (playerShip.oldPosition && (x !== playerShip.oldPosition.x || y !== playerShip.oldPosition.y || r !== playerShip.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: playerShip.x, y: playerShip.y, rotation: playerShip.rotation });
    }
    // save old position data
    playerShip.oldPosition = {
      x: playerShip.x,
      y: playerShip.y,
      rotation: playerShip.rotation
    };

    updateHealthBar(healthBarGraphics, playerHealth);
    healthBarTextGraphics.setText(`${playerHealth}%`);
    playerCoordinatesTextGraphics.setText(`Ship Coordinates: ${playerShip.x.toFixed(0)} : ${playerShip.y.toFixed(0)}`);
  }

  // Calculate the angle between the ship and the target
  if (mouseX !== undefined && mouseY !== undefined) {

    var angle = Phaser.Math.Angle.Between(playerShip.x, playerShip.y, mouseX, mouseY);

    // Calculate the distance between the ship and the target
    var distance = Phaser.Math.Distance.Between(playerShip.x, playerShip.y, mouseX, mouseY);

    // Calculate the ship's velocity based on the angle and speed
    // Adjust the speed based on distance, with a maximum speed of 200
    var maxSpeed = 200;
    var speed = Math.min(distance / 2, maxSpeed);

    playerShip.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    if (Phaser.Math.Distance.Between(playerShip.x, playerShip.y, mouseX, mouseY) < 20) {
      mouseX = undefined;
      mouseY = undefined;
      playerShip.setVelocity(0, 0)
    }
  }
}

