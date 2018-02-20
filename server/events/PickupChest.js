import _ from 'lodash'

class PickupChestEvent {
  constructor(game, socket) {
    socket.on('pickupchest', data => {
      let chest = _.find(game.chests, {id: data.id});
      if(chest) {
        socket.player.gold+=chest.gold;
        socket.player.health+=50;
        if(socket.player.health>100) socket.player.health = 100;

        game.io.emit('pickupchest', {playerID: socket.player.id, health: socket.player.health, chest: chest});

        if(chest.onIsland) {
          let randIsland = game.islands[game.rand(0, game.islands.length-1)];
          game.addChest(randIsland.x, randIsland.y, true);
          game.io.emit('chest', game.chests[game.chests.length-1]);
        }

        _.remove(game.chests, {id: data.id});
      }
    });
  }
}

export default PickupChestEvent
