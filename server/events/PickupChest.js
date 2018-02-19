import _ from 'lodash'

class PickupChestEvent {
  constructor(game, socket) {
    socket.on('pickupchest', data => {
      let chest = _.find(game.chests, {id: data.id});
      if(chest) {
        game.io.emit('pickupchest', {playerID: socket.player.id, chest: chest});
        _.remove(game.chests, {id: data.id});
      }
    });
  }
}

export default PickupChestEvent
