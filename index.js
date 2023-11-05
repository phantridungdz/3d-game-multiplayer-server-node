const express = require("express");
var app = express();
const server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(4000);

var playerSpawnPoints = [];
var clients = [];

app.get("/", function (req, res) {
  res.send('hey you got back get "/"');
});

io.on("connection", function (socket) {
  var currentPlayer = {};
  currentPlayer.name = "unknown";

  socket.on("player connect", function () {
    console.log(currentPlayer.name + " recv: player connect");
    for (var i = 0; i < clients.length; i++) {
      var playerConnected = {
        name: clients[i].name,
        position: clients[i].position,
        rotation: clients[i].position,
        animationTrigger: clients[i].animationTrigger,
      };
      // in your current game, we need to tell you about the other players.
      socket.emit("other player connected", playerConnected);
      console.log(
        currentPlayer.name +
          " emit: other player connected: " +
          JSON.stringify(playerConnected)
      );
    }
  });

  socket.on("play", function (data) {
    dataObject = JSON.parse(data);
    if (
      !dataObject.playerSpawnPoints ||
      dataObject.playerSpawnPoints.length === 0
    ) {
      console.error("No spawn points available.");
      return;
    }
    if (clients.length === 0) {
      playerSpawnPoints = [];
      dataObject.playerSpawnPoints.forEach(function (_playerSpawnPoint) {
        var playerSpawnPoint = {
          position: _playerSpawnPoint.position,
          rotation: _playerSpawnPoint.rotation,
        };
        playerSpawnPoints.push(playerSpawnPoint);
      });
    }

    console.log(currentPlayer.name + " emit: ");
    var randomSpawnPoint =
      playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
    console.log("randomSpawnPoint", randomSpawnPoint);
    currentPlayer = {
      name: dataObject.name,
      position: randomSpawnPoint.position,
      rotation: randomSpawnPoint.rotation,
      animationTrigger: "Idle",
    };
    clients.push(currentPlayer);
    console.log(currentPlayer);
    socket.emit("play", currentPlayer);
    console.log(
      currentPlayer.name + " emit: play: " + JSON.stringify(currentPlayer)
    );
    socket.broadcast.emit("other player connected", currentPlayer);
  });

  socket.on("player move", function (data) {
    dataObject = JSON.parse(data);
    console.log("recv: move: " + JSON.stringify(dataObject));
    currentPlayer.position = dataObject.position;
    socket.broadcast.emit("player move", currentPlayer);
  });

  socket.on("player animate", function (data) {
    dataObject = JSON.parse(data);
    console.log("recv: animate: " + JSON.stringify(dataObject));
    currentPlayer.animationTrigger = dataObject.animationTrigger;
    socket.broadcast.emit("player animate", currentPlayer);
  });

  socket.on("player turn", function (data) {
    dataObject = JSON.parse(data);
    console.log("recv: turn: " + JSON.stringify(dataObject));
    currentPlayer.rotation = dataObject.rotation;
    socket.broadcast.emit("player turn", currentPlayer);
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("other player disconnected", currentPlayer);
    console.log(
      currentPlayer.name +
        " bcst: other player disconnected " +
        JSON.stringify(currentPlayer)
    );
    for (var i = 0; i < clients.length; i++) {
      if (clients[i].name === currentPlayer.name) {
        clients.splice(i, 1);
      }
    }
  });
});

console.log("--- Server is running ----");

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}
