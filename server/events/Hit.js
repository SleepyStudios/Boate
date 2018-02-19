class HitEvent {
  constructor(game, socket) {
    socket.on('playerhit', data => {
      let player = this.getPlayer(game, data.victim).player;
      let victimSocket = this.getPlayer(game, data.victim).socket;
      
      if(player.health>0) player.health-=10;

      game.io.sockets.emit('playerhit', { victim: data.victim, health: player.health});

      if(player.health===0) {
        victimSocket.emit('death');

        game.addChest(player.x-50, player.y-50, false, player.gold);
        game.io.sockets.emit('chest', game.chests[game.chests.length-1]);        
      }
    });
  }

  getPlayer(game, id) {
    let temp = null;

    Object.keys(game.io.sockets.connected).forEach(socketID => {
      let player = game.io.sockets.connected[socketID].player;
      if(player && player.id===id) temp = {player, socket: game.io.sockets.connected[socketID]};
    });

    return temp;
  }
}

export default HitEvent
