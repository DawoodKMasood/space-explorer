import { playerId, playerShip, playerHealth, fireRate } from '../consts/currentPlayerVariable.js';
import { otherPlayers } from '../consts/otherPlayersVariable.js';
import { addPlayer, addOtherPlayers, updateHealthBar } from '../logics/player.js';
import { mouseX, mouseY } from '../consts/systemVariables.js';
import { healthBarGraphics, healthBarTextGraphics, playerNameTextGraphics, playerCoordinatesTextGraphics, bulletsGroup, isFiring } from '../consts/gameVariables.js';
import { Bullet } from '../logics/bullet.js';
import { BulletMaxDistancePerk } from '../logics/bulletMaxDistancePerk.js';

const backgrounds = [];

class GamePlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GamePlayScene' });
    this.lastFired = 0;
  }

  preload() {
    this.load.spritesheet('bullet_spritesheet', 'objects/bullets/shot_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bullet_explosion_spritesheet', 'objects/bullets/shot_explosion_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('explosion_spritesheet', 'objects/explosion/explosion_spritesheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.setBaseURL('http://localhost:8080');
    this.load.image('back', 'background/back.png');
    this.load.image('warrior1', 'objects/ships/warrior1.png');
    this.load.image('smoke', 'objects/smokes/explosion00.png');
    this.load.image('bullet_max_distance_perk', 'objects/skills/Skillicon1_02.png');

    this.load.bitmapFont('nokia16', 'fonts/nokia16.png', 'fonts/nokia16.xml');
  }

  create() {

    this.physics.world.setBounds(0, 0, 4096, 4096);
    this.cameras.main.setBounds(0, 0, 4096, 4096);
    bulletsGroup = this.physics.add.group();
    this.bulletMaxDistanceItemsGroup = this.physics.add.group();

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

    // Start a timer to regenerate player health every second
    this.time.addEvent({
        delay: 5000, // 1000 milliseconds = 1 second
        callback: this.spawnBulletMaxDistancePerkItem,
        callbackScope: this,
        loop: true, // Repeat the timer indefinitely
    });
  }

    regenerateHealth() {
        if (playerHealth < 100) { // Assuming the player's maximum health is 100
        playerHealth += 1; // Increase the player's health by 1
        }
    }

    // Function to spawn perk items randomly
    spawnBulletMaxDistancePerkItem() {
        if (this.bulletMaxDistanceItemsGroup.countActive() < 20) {
            const x = Phaser.Math.Between(0, 4096);
            const y = Phaser.Math.Between(0, 4096);
            const item = new BulletMaxDistancePerk(this, x, y, 'bullet_max_distance_perk', playerShip);
            this.bulletMaxDistanceItemsGroup.add(item);
        }
    }

    // Callback function to handle perk item collection
    collectBulletMaxDistanceItem(player, perkItem) {
        if (player.bonusBulletDistance <= 300) {
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
      if (!this.lastFired || this.time.now - this.lastFired >= fireRate) {
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

  }
}

export { GamePlayScene };