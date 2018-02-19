import Game from '../states/Game'

class Client {
  constructor(game) {
    this.socket = io.connect();

    this.socket.on('disconnect', () => {
      setTimeout(() => {
        location.reload();        
      }, 2000);
    });

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
      game.fire(game.gameObjectHandler.getPlayer(data.id), data.angle);
    });

    this.socket.on('playerhit', data => {
      game.onHit(data.victim, data.health);
    });
  }

  requestJoin() {
    this.socket.emit('newplayer');
  }

  sendMove(x, y, angle) {
    this.socket.emit('playermove', { x, y, angle, timestamp: Date.now() });
  }

  sendFire(angle) {
    this.socket.emit('playerfire', { angle });
  }

  sendOnHit(victim) {
    this.socket.emit('playerhit', { victim });
  }
}

export default Client