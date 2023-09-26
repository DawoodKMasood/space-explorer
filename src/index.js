import Phaser from 'phaser';
import {playerShip, playerHealth, playerCoordinates} from './consts/currentPlayerVariable.js'
import {addPlayer, addOtherPlayers} from './logics/player.js'
import {mouseX, mouseY} from './consts/systemVariables.js'

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
    this.load.setBaseURL('http://localhost:8080');
    this.load.image('back', 'background/back.png');
    this.load.image('warrior1', 'objects/ships/warrior1.png');
    this.load.image('smoke', 'objects/smokes/explosion00.png');
    this.load.bitmapFont('nokia16', 'fonts/nokia16.png', 'fonts/nokia16.xml');
}

function create ()
{
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const background = this.add.image(i * 800, j * 600, 'back');
        backgrounds.push(background);
      }
    }

    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

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
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    
    this.socket.on('playerMoved', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    this.socket.on('playerDisconnected', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        // Assuming playerInfo contains the ID of the disconnected player
        if (otherPlayer.playerID === playerInfo.id) {
          // Remove the disconnected player from the collection
          self.otherPlayers.remove(otherPlayer, true, true);
        }
      });
    });

    playerCoordinates = this.add.bitmapText(10, 0, 'nokia16').setScrollFactor(0);
    playerCoordinates.setDepth(1);
}

function update() {

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

    playerCoordinates.setText(`Ship Coordinates: ${playerShip.x.toFixed(0)} : ${playerShip.y.toFixed(0)}`);
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

