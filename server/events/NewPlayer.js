import MoveEvent from './Move'
import DisconnectEvent from './Disconnect'
import FireEvent from './Fire'
import HitEvent from './Hit'
import PickupChestEvent from './PickupChest'

class NewPlayerEvent {
  constructor(game, socket) {
    socket.on('newplayer', data => {
      let id = game.id()
      socket.player = {
        id: id,
        name: data.name,
        x: game.rand(100, game.worldSize-100),
        y: game.rand(100, game.worldSize-100),
        health: 100,
        gold: 50
      }

      socket.emit('myid', {id})
      socket.emit('allplayers', game.getAllPlayers())
      socket.emit('winddirection', {direction: game.windDirection})

      game.islands.forEach(island => {
        socket.emit('island', island)
      })

      game.chests.forEach(chest => {
        socket.emit('chest', chest)
      })

      socket.broadcast.emit('newplayer', socket.player)

      new MoveEvent(game, socket)
      new DisconnectEvent(game, socket)
      new FireEvent(game, socket)
      new HitEvent(game, socket)
      new PickupChestEvent(game, socket)    
    })
  }
}

export default NewPlayerEvent
