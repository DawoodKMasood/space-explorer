import { playerId, playerShip, playerHealth } from '../consts/currentPlayerVariable.js'
import { otherPlayers } from '../consts/otherPlayersVariable.js';

const BULLET_SPEED = 500;
const BULLET_DAMAGE = 10;
const BULLET_MAX_DISTANCE = 300;

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, rotation, bulletByPlayer, bonusBulletDistance) {
        super(scene, x, y, 'bullet'); // 'bulletAnimation' is the animation key
        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.speed = BULLET_SPEED;
        this.damage = BULLET_DAMAGE;
        this.maxDistance = BULLET_MAX_DISTANCE + (bonusBulletDistance ? (bonusBulletDistance ? bonusBulletDistance : 0) : (playerShip.bonusBulletDistance ? playerShip.bonusBulletDistance : 0));
        this.initialX = x; // Store the initial X position
        this.initialY = y; // Store the initial Y position
        this.bulletByPlayer = bulletByPlayer;
        this.rotation = rotation;
        
        // Create an explosion sprite for this bullet
        this.explosion = scene.add.sprite(x, y, 'bullet_explosion');
        this.explosion.setVisible(false); // Initially, hide the explosion sprite

        // Play the bullet animation
        this.play('bullet');

    }

    // Add a method to handle the explosion
    handleExplosion() {
        this.explosion.setVisible(true);
        this.explosion.play('bullet_explosion');

        this.explosion.on('animationcomplete', () => {
            // Destroy the explosion sprite when the animation is complete
            this.explosion.destroy();
        });
    }

    update() {
        // Use arrow functions for cleaner code
        this.setVelocityX(Math.cos(this.rotation) * this.speed);
        this.setVelocityY(Math.sin(this.rotation) * this.speed);

        const deltaX = this.x - this.initialX;
        const deltaY = this.y - this.initialY;
        this.traveledDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        if (this.bulletByPlayer !== playerId && this.scene.physics.overlap(this, playerShip)) {
            if (playerHealth - this.damage <= 0) {
                playerHealth = 0
            } else {
                playerHealth -= this.damage;
            }
            this.handleExplosion();
            this.destroy();
        }

        otherPlayers.getChildren().forEach((otherPlayer) => {
            if (this.bulletByPlayer !== otherPlayer.playerId && this.scene.physics.overlap(this, otherPlayer)) {
                // Apply damage or other actions to the other player's ship
                // Handle the explosion for this bullet
                this.handleExplosion();
                this.destroy();
            }
        }, this);

        if (this.traveledDistance >= this.maxDistance) {
            this.handleExplosion();
            this.destroy();
        }

        this.explosion.setPosition(this.x, this.y);
    }
}

export {
    Bullet
}