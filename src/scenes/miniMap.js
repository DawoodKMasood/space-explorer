import { playerShip } from "../consts/currentPlayerVariable";
import { otherPlayers } from "../consts/otherPlayersVariable";

class MiniMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MiniMapScene' });
    }

    create() {
        this.screenHeight = this.sys.game.scale.height;

        // Create a graphics object for the minimap background
        const minimapBackground = this.add.graphics();
        minimapBackground.fillStyle(0x000000, 0.50); // White color for the background
        minimapBackground.fillRect(10, this.screenHeight - 210, 210, 200); // Position it at the bottom-left
        minimapBackground.setDepth(1);

        // Create a graphics object for the gray border
        const minimapBorder = this.add.graphics();
        minimapBorder.lineStyle(1, 0x808080, 0.50); // Gray color for the border, 2 pixels wide
        minimapBorder.strokeRect(10, this.screenHeight - 210, 210, 200); // Draw the border around the minimap
        minimapBorder.setDepth(2);

        // Create a graphics object for otherPlayers (red dots) and set fill style
        this.otherPlayerDots = this.add.graphics();
        this.otherPlayerDots.fillStyle(0xff0000, 0.50); // Red color for dots
        this.otherPlayerDots.setDepth(2); // Ensure dots are drawn on top of the background

        // Update currentPlayerDot position
        this.currentPlayerDot = this.add.graphics(); // Create a new graphics object
        this.currentPlayerDot.fillStyle(0xffffff, 0.50); // Black color for the dot
        this.currentPlayerDot.setDepth(3); // Ensure currentPlayer dot is on top of other dots

        // Update the positions of dots for currentPlayer and otherPlayers
        this.updateMiniMap();
    }

    // Function to update the minimap positions
    updateMiniMap() {
        if (playerShip) {
            this.currentPlayerDot.clear();
            this.currentPlayerDot.fillStyle(0xffffff);

            // Calculate the position of the current player dot relative to the minimap rectangle
            const x = 10 + (playerShip.x / 20.1); // 10 is the x position of the minimap
            const y = this.screenHeight - 210 + (playerShip.y / 20.2); // Adjust for the minimap's position

            this.currentPlayerDot.fillCircle(x, y, 2); // Scale down to fit the minimap

            if (otherPlayers && otherPlayers.getChildren) {
                this.otherPlayerDots.clear();
                this.otherPlayerDots.fillStyle(0xff0000);

                otherPlayers.getChildren().forEach((otherPlayer) => {
                    // Calculate the position of other player dots relative to the minimap rectangle
                    const x = 10 + (otherPlayer.x / 20.1); // 10 is the x position of the minimap
                    const y = this.screenHeight - 210 + (otherPlayer.y / 20.2); // Adjust for the minimap's position

                    this.otherPlayerDots.fillCircle(x, y, 1); // Adjust size
                });
            }
        }
    }

    // Update the positions of dots for currentPlayer and otherPlayers
    update() {
        // Call the function to update the minimap positions
        this.updateMiniMap();
    }
}

export {
    MiniMapScene
}