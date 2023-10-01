import { playerId, playerShip, playerHealth, fireRate } from '../consts/currentPlayerVariable.js';
import { otherPlayers } from '../consts/otherPlayersVariable.js';
import { addPlayer, addOtherPlayers, updateHealthBar } from '../logics/player.js';
import { mouseX, mouseY } from '../consts/systemVariables.js';
import { healthBarGraphics, healthBarTextGraphics, playerNameTextGraphics, playerCoordinatesTextGraphics, bulletsGroup, isFiring } from '../consts/gameVariables.js';
import { Bullet } from '../logics/bullet.js';
import { BulletMaxDistancePerk } from '../logics/bulletMaxDistancePerk.js';
import { FiringSpeedPerk } from '../logics/firingSpeedPerk.js';
import { MiniMapScene } from '../scenes/miniMap.js'
import { Asteroid } from '../logics/asteroid.js'

const backgrounds = [];
const asteroids = [];

class GamePlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GamePlayScene' });
    this.lastFired = 0;
  }

  preload() {
    this.load.spritesheet('bullet_spritesheet', 'objects/bullets/shot_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bullet_explosion_spritesheet', 'objects/bullets/shot_explosion_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('explosion_spritesheet', 'objects/explosion/explosion_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('asteroid_explode', 'objects/asteroids/asteroid_explode.png', { frameWidth: 109.714, frameHeight: 96 });

    this.load.setBaseURL('http://localhost:8080');
    this.load.image('back', 'background/back.png');
    this.load.image('warrior1', 'objects/ships/warrior1.png');
    this.load.image('smoke', 'objects/smokes/explosion00.png');
    this.load.image('bullet_max_distance_perk', 'objects/skills/Skillicon1_02.png');
    this.load.image('bullet_firing_speed_perk', 'objects/skills/Skillicon1_22.png');
    this.load.image('asteroid_1', 'objects/asteroids/asteroid_1.png');
    this.load.image('asteroid_2', 'objects/asteroids/asteroid_2.png');

    this.load.bitmapFont('nokia16', 'fonts/nokia16.png', 'fonts/nokia16.xml');
  }

  create() {

    this.physics.world.setBounds(0, 0, 4096, 4096);
    this.cameras.main.setBounds(0, 0, 4096, 4096);
    bulletsGroup = this.physics.add.group();
    this.bulletMaxDistanceItemsGroup = this.physics.add.group();
    this.firingSpeedPerkItemsGroup = this.physics.add.group();
    this.miniMapInitialised = false;

    // Create animations
    const createAnimation = (key, spritesheet, frameRate, repeat) => {
      this.anims.create({
        key,
        frames: spritesheet,
        frameRate,
        repeat,
      });
    };

    createAnimation('bullet', 'bullet_spritesheet', 4, -1);
    createAnimation('bullet_explosion', 'bullet_explosion_spritesheet', 5, 1);
    createAnimation('explosion', 'explosion_spritesheet', 11, 1);
    createAnimation('asteroid_explosion', 'asteroid_explode', 11, 0);

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const background = this.add.image(i * 1024, j * 1024, 'back').setDepth(0);
        backgrounds.push(background);
      }
    }

    this.socket = io();
    otherPlayers = this.physics.add.group();

    this.socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((id) => {
        if (players[id].playerId === this.socket.id) {
          addPlayer(this, players[id]);
        } else {
          addOtherPlayers(this, players[id]);
        }
      });
    });

    this.socket.on('newPlayer', (playerInfo) => {
      addOtherPlayers(this, playerInfo);
    });

    this.socket.on('disconnect', (playerId) => {
      otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on('playerMoved', (playerInfo) => {
      otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    const sceneContext = this;

    this.socket.on('bulletFired', (bulletInfo) => {
      const bullet = new Bullet(sceneContext, bulletInfo.x, bulletInfo.y, bulletInfo.rotation, bulletInfo.bulletByPlayer, bulletInfo.bonusBulletDistance);
      bullet.setRotation(bulletInfo.rotation);
      bulletsGroup.add(bullet);
    });

    this.socket.on('playerDisconnected', (playerInfo) => {
      otherPlayers.getChildren().forEach((otherPlayer) => {
        if (otherPlayer.playerID === playerInfo.id) {
          otherPlayers.remove(otherPlayer, true, true);
        }
      });
    });

    this.socket.on('asteroidCreated', (asteroidData) => {
      const asteroid = new Asteroid(this, asteroidData.x, asteroidData.y, asteroidData.type, asteroidData.direction);
      asteroids.push(asteroid);
    });

    // Create a health bar background
    const healthBarBackground = this.add.graphics();
    healthBarBackground.fillStyle(0xffffff, 0.5);
    healthBarBackground.fillRect(10, 35, 170, 15);
    healthBarBackground.setScrollFactor(0);

    // Create the actual health bar
    healthBarGraphics = this.add.graphics();

    playerNameTextGraphics = this.add.text(0, 0, "Username").setFontSize(10);
    playerCoordinatesTextGraphics = this.add.bitmapText(10, 10, 'nokia16').setScrollFactor(0).setDepth(2);
    healthBarTextGraphics = this.add.bitmapText(190, 35, 'nokia16').setScrollFactor(0).setDepth(2);

    // Start a timer to regenerate player health every second
    this.time.addEvent({
        delay: 1000, // 1000 milliseconds = 1 second
        callback: this.regenerateHealth,
        callbackScope: this,
        loop: true, // Repeat the timer indefinitely
    });

    this.time.addEvent({
        delay: 10000, // 10000 milliseconds
        callback: this.spawnBulletMaxDistancePerkItem,
        callbackScope: this,
        loop: true, // Repeat the timer indefinitely
    });

    this.time.addEvent({
        delay: 10000, // 10000 milliseconds
        callback: this.spawnFiringSpeedPerkItem,
        callbackScope: this,
        loop: true, // Repeat the timer indefinitely
    });

    this.physics.add.overlap(bulletsGroup, asteroids, this.bulletAsteroidCollision, null, this);
  }

    // Create a function to handle bullet-asteroid collisions
    bulletAsteroidCollision(asteroid, bullet) {
      bullet.destroy();
      asteroid.takeDamage(10); // Adjust the damage value as needed
    }

    regenerateHealth() {
        if (playerHealth < 100) { // Assuming the player's maximum health is 100
        playerHealth += 1; // Increase the player's health by 1
        }
    }

    // Function to spawn perk items randomly
    spawnBulletMaxDistancePerkItem() {
        if (this.bulletMaxDistanceItemsGroup.countActive() < 1) {
            const x = Phaser.Math.Between(100, 4000);
            const y = Phaser.Math.Between(100, 4000);
            const item = new BulletMaxDistancePerk(this, x, y, 'bullet_max_distance_perk', playerShip);
            this.bulletMaxDistanceItemsGroup.add(item);
        }
    }

    // Function to spawn firing speed perk items randomly
    spawnFiringSpeedPerkItem() {
        if (this.firingSpeedPerkItemsGroup.countActive() < 1) {
            const x = Phaser.Math.Between(100, 4000);
            const y = Phaser.Math.Between(100, 4000);
            const item = new FiringSpeedPerk(this, x, y, 'bullet_firing_speed_perk', playerShip);
            this.firingSpeedPerkItemsGroup.add(item);
        }
    }

    // Callback function to handle perk item collection
    collectBulletMaxDistanceItem(player, perkItem) {
        if (player.bonusBulletDistance <= 300) {
            perkItem.collect();
        }
    }

    // Callback function to handle firing speed perk item collection
    collectFiringSpeedItem(player, perkItem) {
        if (player.bonusFiringSpeed <= 3) { // Define MAX_FIRING_SPEED as the maximum firing speed value
            perkItem.collect();
        }
    }

  update() {
    if (playerShip && playerHealth <= 0) {
      if (!playerShip.isExploding) {
        this.socket.emit('shipExploded', { x: playerShip.x, y: playerShip.y, playerId });

        const explosion = this.add.sprite(playerShip.x, playerShip.y, 'explosion_spritesheet');
        explosion.anims.play('explosion');
        explosion.on('animationcomplete', () => {
          explosion.destroy();
          this.scene.start('GameOverScene');
          this.scene.stop();
          this.scene.remove('MiniMapScene');
        });

        playerShip.isExploding = true;
        playerShip.setVelocity(0, 0);
        isFiring = false;
        playerShip.destroy();

        this.socket.disconnect();
      }
    }

    if (this.input.activePointer.leftButtonDown() && playerHealth > 0 && !playerShip.isExploding) {
      if (!isFiring) {
        isFiring = true;
        this.lastFired = 0;
      }
    } else {
      isFiring = false;
    }

    if (isFiring && !playerShip.isExploding) {
      if (!this.lastFired || this.time.now - this.lastFired >= (fireRate / playerShip.bonusFiringSpeed)) {
        const bullet = new Bullet(this, playerShip.x, playerShip.y, playerShip.rotation, playerId);
        bullet.setRotation(playerShip.rotation);
        bulletsGroup.add(bullet);
        this.lastFired = this.time.now;
        this.socket.emit('bullet', { x: playerShip.x, y: playerShip.y, bulletByPlayer: playerId, rotation: playerShip.rotation, bonusBulletDistance: playerShip.bonusBulletDistance });
      }
    }

    if (bulletsGroup) {
      bulletsGroup.children.iterate((bullet) => {
        if (bullet) {
          bullet.update();
        }
      });
    }

    if (asteroids) {
      asteroids.map((asteroid) => {
        if (asteroid) {
          asteroid.update();
        }
      });
    }

    if (playerShip !== undefined && !playerShip.isExploding) {
      const x = playerShip.x;
      const y = playerShip.y;
      const r = playerShip.rotation;
      if (playerShip.oldPosition && (x !== playerShip.oldPosition.x || y !== playerShip.oldPosition.y || r !== playerShip.oldPosition.rotation)) {
        this.socket.emit('playerMovement', { x, y, rotation: r });
      }

      playerShip.oldPosition = { x, y, rotation: r };

      updateHealthBar(healthBarGraphics, playerHealth);
      playerNameTextGraphics.setText(playerId).setPosition(playerShip.x - 55, playerShip.y + 30);
      healthBarTextGraphics.setText(`${playerHealth}%`);
      playerCoordinatesTextGraphics.setText(`Ship Coordinates: ${x.toFixed(0)} : ${y.toFixed(0)}`);
      this.physics.overlap(playerShip, this.bulletMaxDistanceItemsGroup, this.collectBulletMaxDistanceItem, null, this);
      this.physics.overlap(playerShip, this.firingSpeedPerkItemsGroup, this.collectFiringSpeedItem, null, this);
      this.events.on('asteroidDestroyed', (asteroid) => {
        const index = asteroids.indexOf(asteroid);
        if (index !== -1) {
            asteroids.splice(index, 1);
        }
      });
    }

    if (playerShip && !playerShip.isExploding && mouseX !== undefined && mouseY !== undefined && playerHealth > 0) {
      const angle = Phaser.Math.Angle.Between(playerShip.x, playerShip.y, mouseX, mouseY);
      const distance = Phaser.Math.Distance.Between(playerShip.x, playerShip.y, mouseX, mouseY);
      const maxSpeed = 200;
      const speed = Math.min(distance / 2, maxSpeed);
      playerShip.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      if (Phaser.Math.Distance.Between(playerShip.x, playerShip.y, mouseX, mouseY) < 20) {
        mouseX = undefined;
        mouseY = undefined;
        playerShip.setVelocity(0, 0);
      }
    }

    if (playerShip && !this.miniMapInitialised && !playerShip.isExploding) {
        this.miniMapInitialised = true;
        this.scene.add('MiniMapScene', MiniMapScene, true);
    }

  }
}

export { GamePlayScene };