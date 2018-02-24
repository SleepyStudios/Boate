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
          // find which island it's on
          let chestIsland = -1;
          for(let i=0; i<game.islands.length; i++) {
            if(chest.x===game.islands[i].x && chest.y===game.islands[i].y) {
              chestIsland = i;
              break;
            }
          }

          // spawn it on a new island
          if(chestIsland!==-1) {
            let newIsland = game.rand(0, game.islands.length-1);
            while(newIsland===chestIsland || game.islands[newIsland].hasChest) newIsland = game.rand(0, game.islands.length-1);
            game.islands[chestIsland].hasChest = false;
            game.islands[newIsland].hasChest = true;

            game.addChest(game.islands[newIsland].x, game.islands[newIsland].y, true);
          }
        }

        _.remove(game.chests, {id: data.id});
      }
    });
  }
}

export default PickupChestEvent
