class FireEvent {
  constructor(game, socket) {
    socket.on('playerfire', data => {
      socket.broadcast.emit('playerfire', {id: socket.player.id, gun: data.gun});
    });
  }
}

export default FireEvent
