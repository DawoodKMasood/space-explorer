class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, direction) {
        super(scene, x, y, type);
        const size = Math.random() * 1.5 + 0.5;

        if (type === 1) {
            this.setTexture('asteroid_1');
        } else if (type === 2) {
            this.setTexture('asteroid_2');
        }

        // Create an explosion sprite for this bullet
        this.explosion = scene.add.sprite(x, y, 'asteroid_explosion');

        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.setScale(size);
        this.speed = (Math.random() * 200)
        this.type = type; // 'normal' or 'flaming'
        this.rotationSpeed = Phaser.Math.Between(1, 3); // Adjust the range as needed
        this.setVelocity(direction.x * this.speed, direction.y * this.speed);
        this.setRotation(Math.random() * Math.PI * 2); // Random initial rotation for normal asteroids
        this.health = Math.floor(size * 100); // Health based on size
    }

    update() {
        this.angle += this.rotationSpeed; // Rotate normal asteroids

        // Check if the asteroid is outside the bounds and destroy it if it is
        const { x, y } = this;
        if (x < -200 || x > 4300 || y < -200 || y > 4300) {
            // Emit an event to notify asteroid destruction
            this.scene.events.emit('asteroidDestroyed', this);

            this.destroy();
        }
    }

    takeDamage(damage) {
        this.health -= damage;

        // Apply a red tint temporarily
        this.setTint(0xff0000); // Red tint
        
        // Delay to remove the tint after a short duration (e.g., 200 milliseconds)
        this.scene.time.delayedCall(100, () => {
            // Remove the tint
            this.clearTint();
        });

        if (this.health <= 0) {
            // Emit an event to notify asteroid destruction
            this.scene.events.emit('asteroidDestroyed', this);
            // Play the explosion animation
            this.play('asteroid_explosion');
            // Listen for animation complete event
            this.on('animationcomplete', () => {
                // Destroy the asteroid when the animation is complete
                this.destroy();
            });
        }
    }
}

export {
    Asteroid
}