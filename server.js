const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const DIST_DIR = path.join(__dirname, '/dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

app.use(express.static('public'))
app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
  res.sendFile(HTML_FILE);
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

/*
Socket IO
*/

var players = {};

io.on('connection', (socket) => {
  // create a new player and add it to our players object
  players[socket.id] = {
    health: 100,
    fireRate: 300,
    rotation: 0,
    x: Math.floor(Math.random() * 4096),
    y: Math.floor(Math.random() * 4096),
    playerId: socket.id,
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function () {
    // update all other players of the new player
    socket.broadcast.emit('playerDisconnected', players[socket.id]);
    // remove this player from our players object
    delete players[socket.id];
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('bullet', function (bulletData) {
    socket.broadcast.emit('bulletFired', bulletData);
  });

  const asteroids = [];

  function generateAsteroid() {
    // Generate initial positions outside the map
    let x, y;
    const type = Math.random() < 0.5 ? 1 : 2; // Randomly select type

    // Randomly select a side of the map to spawn the asteroid
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

    switch (side) {
        case 0: // Top
            x = Math.random() * 4200; // Random X position within the map's width
            y = -100; // Position just above the map
            break;
        case 1: // Right
            x = 4200; // Position just to the right of the map
            y = Math.random() * 4200; // Random Y position within the map's height
            break;
        case 2: // Bottom
            x = Math.random() * 4200; // Random X position within the map's width
            y = 4200; // Position just below the map
            break;
        case 3: // Left
            x = -100; // Position just to the left of the map
            y = Math.random() * 4200; // Random Y position within the map's height
            break;
    }

    const angle = Math.random() * Math.PI * 2; // Random angle in radians

    const direction = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };

    const asteroid = {
        x,
        y,
        type,
        direction,
        health: type === 1 ? Math.floor(Math.random() * 150) + 50 : 100,
    };

    asteroids.push(asteroid);

    // Broadcast the asteroid data to all connected clients
    io.emit('asteroidCreated', asteroid);
  }

  // Periodically generate asteroids (adjust timing as needed)
  setInterval(() => {
      if (asteroids.length < 200) {
          generateAsteroid();
      }
  }, 1000); // Generate every 5 seconds, adjust as needed
});