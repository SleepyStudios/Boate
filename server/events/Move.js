class MoveEvent {
  constructor(game, socket) {
    socket.on('playermove', data => {
      let moved = !socket.lastMoveTimestamp || data.timestamp > socket.lastMoveTimestamp

      if(moved) {
        socket.player.x = data.x
        socket.player.y = data.y
        socket.player.angle = data.angle
        socket.broadcast.emit('playermove', socket.player)
        
        socket.lastMoveTimestamp = data.timestamp
      }
    })
  }
}

export default MoveEvent
