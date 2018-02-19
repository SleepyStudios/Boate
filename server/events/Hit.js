class HitEvent {
  constructor(game, socket) {
    socket.on('playerhit', data => {
      let player = this.getPlayer(game, data.victim).player;
      let victimSocket = this.getPlayer(game, data.victim).socket;
      
      if(player.health>0) player.health-=10;

      game.io.sockets.emit('playerhit', { victim: data.victim, health: player.health});

      if(player.health===0) {
        victimSocket.emit('death');

        let chest = {id: game.id(), x: player.x, y: player.y, gold: player.gold};
        game.chests.push(chest);
        game.io.sockets.emit('chest', chest);        
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
