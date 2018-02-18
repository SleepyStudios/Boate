class FireEvent {
  constructor(game, socket) {
    socket.on('playerfire', data => {
      socket.broadcast.emit('playerfire', {id: socket.player.id, angle: data.angle});
    });
  }
}

export default FireEvent
