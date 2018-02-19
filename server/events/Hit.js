class HitEvent {
  constructor(game, socket) {
    socket.on('playerhit', data => {
      if(socket.player.health>0) socket.player.health-=10;

      game.io.sockets.emit('playerhit', { victim: data.victim, health: socket.player.health});
    });
  }
}

export default HitEvent
