import Phaser from 'phaser';

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

var ship;
var targetX;
var targetY;
var background;
var shipCoordinates;

function preload ()
{
    this.load.setBaseURL('http://localhost:8080');
    this.load.tilemapTiledJSON('map', 'maps/infinite.json');
    this.load.image('back', 'background/back.png');
    this.load.image('warrior1', 'objects/ships/warrior1.png');
    this.load.image('smoke', 'objects/smokes/explosion00.png');
    this.load.bitmapFont('nokia16', 'fonts/nokia16.png', 'fonts/nokia16.xml');
}

function create ()
{
    const map = this.make.tilemap({ key: 'map' });

    background = this.add.tileSprite(0, 0, config.width * 2, config.height * 2, 'back');
    background.setOrigin(0, 0);
    
    const particles = this.add.particles(0, 0, 'smoke', {
      quantity: 5,
      scale: { start: 0.01, end: 0.001 },
    });

    ship = this.physics.add.sprite(400, 300, 'warrior1');
    // Set the scale of the sprite
    ship.setScale(0.1, 0.1);
    // Enable input for the sprite so that it can interact with the mouse
    ship.setInteractive();
    

    // Add a pointer move event to update the sprite's rotation
    this.input.on('pointermove', function (pointer) {
        // Calculate the angle between the sprite and the mouse pointer
        var angle = Phaser.Math.Angle.Between(ship.x, ship.y, pointer.x, pointer.y);
        // Convert radians to degrees and set the sprite's angle
        ship.setAngle(Phaser.Math.RAD_TO_DEG * angle);

        targetX = pointer.x;
        targetY = pointer.y;
    }, this);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    

    particles.startFollow(ship);

    shipCoordinates = this.add.bitmapText(0, 0, 'nokia16').setScrollFactor(0);

}

function update() {
  shipCoordinates.setText(`Ship Coordinates: ${ship.x.toFixed(0)} : ${ship.y.toFixed(0)}`);

  // Calculate the angle between the ship and the target
  if (targetX !== undefined && targetY !== undefined) {
    var angle = Phaser.Math.Angle.Between(ship.x, ship.y, targetX, targetY);

    // Calculate the distance between the ship and the target
    var distance = Phaser.Math.Distance.Between(ship.x, ship.y, targetX, targetY);

    // Calculate the ship's velocity based on the angle and speed
    // Adjust the speed based on distance, with a maximum speed of 75
    var maxSpeed = 75;
    var speed = Math.min(distance / 3, maxSpeed);

    ship.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Stop when the ship is close to the target
    if (Phaser.Math.Distance.Between(ship.x, ship.y, targetX, targetY) < 10) {
      ship.setVelocity(0, 0);
    }
  } else {
    // If there's no target, stop the ship
    ship.setVelocity(0, 0);
  }

  // // Calculate the offset for the background based on the camera position
  var cameraOffsetX = ship.x;
  var cameraOffsetY = ship.y;

  // // Update the background position to create the illusion of an infinite map
  background.tilePositionX = cameraOffsetX * 5; // Adjust the factor as needed
  background.tilePositionY = cameraOffsetY * 5; // Adjust the factor as needed
}

