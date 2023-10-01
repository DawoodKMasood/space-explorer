
# Space Explorer

## Overview

Welcome to the Space Explorer Multiplayer project, a Phaser 3-based game developed by Dawood Khan Masood. This README provides essential information to get you started with the game.

![Game Play](https://github.com/DawoodKMasood/space-explorer/blob/main/screenshot1.png?raw=true)

## Installation

To run this game locally, follow these steps:

1.  Clone this repository to your local machine:
    
    `git clone https://github.com/DawoodKMasood/space-explorer.git` 
    
2.  Navigate to the project directory:
    
    `cd space-explorer` 
    
3.  Install the required dependencies:
    
    `npm install` 
    

## Usage

To play the game, execute the following command:

`npm run start` 

This will launch the game in your web browser. Use the specified controls to interact with the game.

## Game Code Structure

The game's source code is organized into multiple files and directories to maintain clarity and modularity. Here's an overview of the key components:

-   **Player Variables**: The game manages various player-related variables and constants, including the player's ID, ship, health, and firing rate.
    
-   **Game Logic**: The logic for adding and updating players, bullets, and perks is encapsulated in separate modules.
    
-   **Assets**: The game loads various assets, such as spritesheets, images, fonts, and more, to enhance the gaming experience.
    
-   **Game Scenes**: The `GamePlayScene` is where most of the game's action takes place. It's responsible for setting up the game world, handling player input, and managing game elements.
    
-   **Animations**: The code includes animations for bullets, explosions, and other in-game effects.
    
-   **Socket.io Integration**: The game uses Socket.io for real-time multiplayer functionality, allowing players to interact with each other.
    
-   **Health and Perks**: There are functions to manage player health, spawn perk items, and handle perk item collection.
    
-   **Update Loop**: The `update` method is responsible for updating game elements, checking for collisions, and managing player actions.

## Game Play

The `GamePlayScene` is the core scene where the gameplay of your game takes place. In this scene, players control their spaceships, interact with other players, shoot bullets, collect power-ups, and engage with the game's mechanics. Here's an overview of key components and functionalities within this scene:

### Player Controls

-   **Spaceship Control**: Players can control their spaceships using the mouse pointer. The spaceship follows the movement of the mouse cursor on the screen.
    
-   **Shooting**: Players can shoot bullets from their spaceship by clicking the left mouse button. The firing rate can vary based on the spaceship's firing speed.
    

### Game Elements

-   **Background**: A visually appealing background is displayed to create an immersive gaming environment. Multiple background layers are used for added depth.
    
-   **Earth Sprite**: An Earth sprite is positioned at the center of the map, adding to the visual appeal of the game.
    
-   **Other Players**: Players can see and interact with other online players who are also part of the game. Their movements and actions are synchronized in real-time.
    
-   **Asteroids**: Asteroids are dynamic game objects that players can interact with. Shooting asteroids can yield rewards or affect gameplay.

![Asteroids](https://github.com/DawoodKMasood/space-explorer/blob/main/screenshot3.png?raw=true)
    
-   **Health Bar**: A health bar is displayed to show the player's current health status. Health regenerates over time if below the maximum value.
    

### Power-Ups

![Game Perks](https://github.com/DawoodKMasood/space-explorer/blob/main/screenshot2.png?raw=true)

-   **Bullet Max Distance Perk**: These power-ups enhance the distance bullets can travel. Players can collect them for extended shooting range.
    
-   **Firing Speed Perk**: These power-ups boost the firing speed of the player's spaceship. Collecting them increases the rate of fire.
    

### Game Over

-   **Game Over Handling**: When a player's health reaches zero, their spaceship explodes, and a game over scenario is triggered. Players are then presented with the option to restart the game.
    
-   **Restart Button**: A "Restart" button allows players to initiate a new game session if they choose to do so.
    

### Mini-Map

-   **Mini-Map Integration**: The `GamePlayScene` also initializes and integrates the Mini-Map, providing players with an overview of the game environment and the positions of other players.

### Real-Time Multiplayer

![Multiplayer](https://github.com/DawoodKMasood/space-explorer/blob/main/screenshot4.png?raw=true)

-   **Real-Time Interaction**: The scene is designed for real-time multiplayer interaction, allowing players to see and interact with other players sharing the same game world.

----------

This `GamePlayScene` serves as the central hub for your game's mechanics and interactivity. Players can explore, compete, and collaborate with others in this dynamic gaming environment.

Feel free to customize and expand upon the features and functionalities of this scene to create a rich and engaging gameplay experience for your players.

## How to Contribute

If you're interested in contributing to the development of this game, follow these steps:

1.  Fork this repository to your GitHub account.
2.  Clone the forked repository to your local machine.
3.  Create a new branch for your contribution: `git checkout -b feature/new-feature`.
4.  Make your changes and commit them: `git commit -m "Add new feature"`.
5.  Push your changes to your GitHub repository: `git push origin feature/new-feature`.
6.  Create a pull request from your branch to the original repository.
7.  Wait for review and collaboration with the project owner.

## Licensing

This game project is open-source and is licensed under the MIT License. You can find the full license details in the `LICENSE` file.

## Contact

For any inquiries, questions, or collaboration opportunities related to the game development, please contact Dawood Khan Masood at [dawoodkmasood@gmail.com](mailto:dawoodkmasood@gmail.com).