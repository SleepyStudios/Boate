import ConnectionEvent from './events/Connection'

class Game {
  constructor(app) {
    this.io = require('socket.io')(app);
    new ConnectionEvent(this);

    this.windDirection = 0;
    setInterval(() => {
      this.windDirection = this.rand(0, 360);
      this.io.emit('winddirection', {direction: this.windDirection});
    }, 10000);

    this.chests = [];
    this.islands = [];
    this.genIslands();
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

  id() {
    return this.rand(1, 1000000);
  }

  genIslands() {
    this.worldSize = 4096;
    let islandSize = 300;
    let numIslands = Math.floor(this.worldSize/200);
    let numTreasures = numIslands/4;
    
    for(let i=0; i<numIslands; i++) {
      let randX = Math.floor(Math.random() * (this.worldSize-islandSize));
      let randY = Math.floor(Math.random() * (this.worldSize-islandSize));

      while(this.islands.some(i => {
        return this.getDistance(randX, randY, i)<=islandSize*1.5;
      })) {
        randX = Math.floor(Math.random() * (this.worldSize-islandSize));
        randY = Math.floor(Math.random() * (this.worldSize-islandSize));
      }
      this.islands.push({id: this.id(), x: randX, y: randY, angle: this.rand(0, 360)});
    }

    for(let i=0; i<numTreasures; i++) {
      this.addChest(this.islands[i].x, this.islands[i].y, true);
    }
  }

  getDistance(x, y, otherIsland) {
    let a = x - otherIsland.x;
    let b = y - otherIsland.y;

    return Math.sqrt(a*a + b*b);
  }

  addChest(x, y, onIsland, gold) {
    let chest = {id: this.id(), x, y, onIsland, gold: gold ? gold : this.rand(50, 200)};
    this.chests.push(chest);
    this.io.sockets.emit('chest', chest);     
  }
}

export default Game
