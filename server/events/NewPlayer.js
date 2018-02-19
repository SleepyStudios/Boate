import MoveEvent from './Move'
import DisconnectEvent from './Disconnect'
import FireEvent from './Fire'
import HitEvent from './Hit'

class NewPlayerEvent {
  constructor(game, socket) {
    socket.on('newplayer', data => {
      socket.player = {
        id: ++game.lastPlayerID,
        name: data.name,
        x: game.rand(100, 1200),
        y: game.rand(100, 1200),
        health: 100,
        gold: 50
      }

      socket.emit('myid', {id: game.lastPlayerID});
      socket.emit('allplayers', game.getAllPlayers());
      game.chests.forEach(chest => {
        socket.emit('chest', {x: chest.x, y: chest.y, gold: chest.gold});
      });
      socket.emit('winddirection', {direction: game.windDirection});      
      socket.broadcast.emit('newplayer', socket.player);

      new MoveEvent(game, socket);
      new DisconnectEvent(game, socket);
      new FireEvent(game, socket);
      new HitEvent(game, socket);
    });
  }
}

export default NewPlayerEvent
