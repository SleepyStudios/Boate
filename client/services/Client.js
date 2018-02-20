import Game from '../states/Game'

class Client {
  constructor(game, name) {
    this.socket = io.connect();
    this.name = name;

    this.socket.on('myid', data => {
      game.myID = data.id;
    });

    this.socket.on('newplayer', data => {
      game.gameObjectHandler.addPlayer(data);
    });

    this.socket.on('allplayers', data => {
      for(let i=0; i<data.length; i++) {
        game.gameObjectHandler.addPlayer(data[i]);
      }
    });

    this.socket.on('playermove', data => {
      game.gameObjectHandler.movePlayer(data.id, data.x, data.y, data.angle);
    });

    this.socket.on('remove', id => {
      game.gameObjectHandler.removePlayer(id);
    });

    this.socket.on('playerfire', data => {
      game.fire(game.gameObjectHandler.getPlayer(data.id), data.gun);
    });

    this.socket.on('playerhit', data => {
      game.onHit(data.victim, data.health);
    });

    this.socket.on('death', () => {
      this.socket.disconnect();      
      game.state.start('Menu', true, true, {intro: "You died!", name: this.name});
    });

    this.socket.on('winddirection', data => {
      game.gameObjectHandler.updateWind(data.direction);
    });

    this.socket.on('chest', data => {
      game.gameObjectHandler.addChest(data);
    });

    this.socket.on('pickupchest', data => {
      game.gameObjectHandler.pickupChest(data);
    });

    this.socket.on('island', data => {
      game.gameObjectHandler.addIsland(data);
    });
  }

  requestJoin() {
    this.socket.emit('newplayer', { name: this.name });
  }

  sendMove(x, y, angle) {
    this.socket.emit('playermove', { x, y, angle, timestamp: Date.now() });
  }

  sendFire(gun) {
    this.socket.emit('playerfire', { gun });
  }

  sendOnHit(victim) {
    this.socket.emit('playerhit', { victim });
  }

  sendPickupChest(id) {
    this.socket.emit('pickupchest', { id });
  }
}

export default Client