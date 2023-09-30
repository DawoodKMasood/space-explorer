class BulletMaxDistancePerk extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, playerShip) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.playerShip = playerShip; // Store a reference to the player ship

        // Create animations or perform any necessary setup here
    }

    // Implement any functionality specific to the perk item, e.g., what happens when a player collects it
    // For example, increase the max bullet distance for the player
    collect() {
        // Implement the logic for collecting the perk item here
        // For example, increase the player's max bullet distance
        this.playerShip.bonusBulletDistance += 50;

        // Destroy the perk item once collected
        this.destroy();
    }

    // You can add more methods or functionality as needed
}

export {
    BulletMaxDistancePerk
}