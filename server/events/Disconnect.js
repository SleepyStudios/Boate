class DisconnectEvent {
  constructor(game, socket) {
    socket.on('disconnect', () => {
      game.io.emit('remove', socket.player.id);

      // spawn a chest at their location
      game.addChest(socket.player.x-50, socket.player.y-50, false, socket.player.gold);      
    });
  }
}

export default DisconnectEvent
