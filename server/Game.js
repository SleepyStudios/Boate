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
    }, 10000);

    this.chests = [{id: this.id(), x: 100, y: 100, gold: 20}];

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
    let worldSize = 4096;
    let islandSize = 300;
    let numIslands = Math.floor(worldSize/200);
    let numTreasures = numIslands/4;
    
    for(let i=0; i<20; i++) {
      let randX = Math.floor(Math.random() * (worldSize-islandSize));
      let randY = Math.floor(Math.random() * (worldSize-islandSize));

      while(this.islands.some(i => {
        return this.getDistance(randX, randY, i)<=islandSize;
      })) {
        randX = Math.floor(Math.random() * (worldSize-islandSize));
        randY = Math.floor(Math.random() * (worldSize-islandSize));
      }
      this.islands.push({id: this.id(), x: randX, y: randY, angle: this.rand(0, 360)});
    }

    for(let i=0; i<numTreasures; i++) {
      this.chests.push({id: this.id(), x: this.islands[i].x, y: this.islands[i].y, gold: this.rand(50, 200), onIsland: true});
    }
  }

  getDistance(x, y, otherIsland) {
    let a = x - otherIsland.x;
    let b = y - otherIsland.y;

    return Math.sqrt(a*a + b*b);
  }
}

export default Game
