import ConnectionEvent from './events/Connection'

class Game {
  constructor(app) {
    this.lastPlayerID = 0;
    this.io = require('socket.io')(app);
    new ConnectionEvent(this);

    this.windDirection = 0;
    setInterval(() => {
      this.windDirection = this.rand(0, 360);
      this.io.emit('winddirection', {direction: this.windDirection});
    }, 10000)
  }

  getAllPlayers() {
    let players = [];
    
    Object.keys(this.io.sockets.connected).forEach(socketID => {
      let player = this.io.sockets.connected[socketID].player;
      if(player) players.push(player);
    });
    return players;
  }

  rand(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }
}

export default Game
