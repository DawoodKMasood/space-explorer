import { otherPlayers } from '../consts/otherPlayersVariable.js';
import {playerId, playerShip, playerHealth, fireRate } from '../consts/currentPlayerVariable.js'
import {mouseX, mouseY} from '../consts/systemVariables.js'
import { isFiring } from '../consts/gameVariables.js'

function addPlayer(self, playerInfo) {
    playerShip = self.physics.add.image(playerInfo.x, playerInfo.y, 'warrior1').setScale(0.15, 0.15).setDepth(1);
    // Enable input for the sprite so that it can interact with the mouse
    playerShip.setInteractive();
    
    playerId = playerInfo.playerId;
    playerHealth = playerInfo.health;
    fireRate = playerInfo.fireRate;
  
    const particles = self.add.particles(0, 0, 'smoke', {
      speed: {
        onEmit: (particle, key, t, value) => 10
      },
      lifespan: {
        onEmit: (particle, key, t, value) => Phaser.Math.Percent(playerShip.body.speed, 0, 300) * 2000
      },
      blendMode: 'ADD',
      scale: { start: 0.03, end: 0.0003 },
    });
  
    particles.startFollow(playerShip);
  
    // Add a pointer move event to update the sprite's rotation
    self.input.on('pointermove', function (pointer) {
      // Calculate the angle between the sprite and the mouse pointer
      var angle = Phaser.Math.Angle.Between(playerShip.x, playerShip.y, pointer.worldX, pointer.worldY);
      // Convert radians to degrees and set the sprite's angle
      playerShip.setAngle(Phaser.Math.RAD_TO_DEG * angle);
  
      mouseX = pointer.worldX;
      mouseY = pointer.worldY;
    }, this);
  
    // Set the camera to follow the playerShip
    self.cameras.main.startFollow(playerShip);

    // Add event listeners for pointer events
    self.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) {
            isFiring = true; // Start firing when left mouse button is pressed
        }
    });

    self.input.on('pointerup', (pointer) => {
        if (!pointer.leftButtonDown()) {
            isFiring = false; // Stop firing when left mouse button is released
        }
    });
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'warrior1').setScale(0.15, 0.15).setDepth(1);
    otherPlayer.playerId = playerInfo.playerId;
    
    const particles = self.add.particles(0, 0, 'smoke', {
      speed: {
        onEmit: (particle, key, t, value) => 10
      },
      blendMode: 'DARKEN',
      scale: { start: 0.03, end: 0.0005 },
    });
    particles.startFollow(otherPlayer);
  
    otherPlayers.add(otherPlayer);
}

// Function to update the health bar
function updateHealthBar(healthBar, health) {
    healthBar.clear();
    healthBar.fillStyle(0x00FF00, 1); // Green with full opacity
    healthBar.fillRect(10, 35, (health / 100) * 170, 15); // Adjust width based on ship's health
    healthBar.setScrollFactor(0)
}

export {
    addPlayer,
    addOtherPlayers,
    updateHealthBar,
}