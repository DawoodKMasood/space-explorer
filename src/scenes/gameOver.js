class GameOverScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameOverScene' });
    }
  
    create() {
      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;
    
      // Display a game over message at the center
      const gameOverText = this.add.text(
        centerX,
        centerY - 50, // Adjust the Y position as needed
        'Game Over',
        { fontSize: '32px', fill: '#fff' }
      );
      gameOverText.setOrigin(0.5);
    
      // Add a restart button at the center
      const restartButton = this.add.text(
        centerX,
        centerY + 50, // Adjust the Y position as needed
        'Restart',
        { fontSize: '24px', fill: '#fff' }
      );
      restartButton.setOrigin(0.5);
      restartButton.setInteractive();
      restartButton.on('pointerdown', () => {
        this.scene.start('GamePlayScene');
      });
    }
  }

export {
  GameOverScene
}