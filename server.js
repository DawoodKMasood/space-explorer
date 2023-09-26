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
    rotation: 0,
    x: Math.floor(Math.random() * 400) + 50,
    y: Math.floor(Math.random() * 300) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
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
});