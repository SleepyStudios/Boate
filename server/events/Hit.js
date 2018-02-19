class HitEvent {
  constructor(game, socket) {
    socket.on('playerhit', data => {
      socket.broadcast.emit('playerhit', { victim: data.victim });
    });
  }
}

export default HitEvent
