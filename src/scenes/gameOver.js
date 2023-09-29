class GameOverScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameOverScene' });
    }
  
    create() {
      // Display a game over message
      const gameOverText = this.add.text(
        400,
        300,
        'Game Over',
        { fontSize: '32px', fill: '#fff' }
      );
      gameOverText.setOrigin(0.5);
  
      // Add a restart button
      const restartButton = this.add.text(
        400,
        350,
        'Restart',
        { fontSize: '24px', fill: '#fff' }
      );
      restartButton.setOrigin(0.5);
      restartButton.setInteractive();
      restartButton.on('pointerdown', () => {
        this.scene.start( 'GamePlayScene' );
      });
    }
  }

export {
  GameOverScene
}