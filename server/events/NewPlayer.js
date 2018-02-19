import MoveEvent from './Move'
import DisconnectEvent from './Disconnect'
import FireEvent from './Fire'
import HitEvent from './Hit'
import PickupChestEvent from './PickupChest'

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
      socket.emit('winddirection', {direction: game.windDirection});

      game.islands.forEach(island => {
        socket.emit('island', island);
      });

      game.chests.forEach(chest => {
        socket.emit('chest', chest);
      });

      socket.broadcast.emit('newplayer', socket.player);

      new MoveEvent(game, socket);
      new DisconnectEvent(game, socket);
      new FireEvent(game, socket);
      new HitEvent(game, socket);
      new PickupChestEvent(game, socket);    
      
      setTimeout(() => {
        Object.keys(game.io.sockets.connected).forEach(socketID => {
          let player = game.io.sockets.connected[socketID].player;
          if(player && player.id!==socket.player.id) socket.broadcast.emit('playermove', player);
        });
      }, 10000)
    });
  }
}

export default NewPlayerEvent
