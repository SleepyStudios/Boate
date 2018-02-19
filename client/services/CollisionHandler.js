import Game from '../states/Game'
import _ from 'lodash'

class CollisionHandler {
  constructor(game) {
    this.game = game;
  }

  hitPlayer(bullet, player) {
    if(player.id===this.game.myID) return;

    bullet.kill();
    this.resetVelocity(player);

    this.game.camera.flash(0xffffff, 500);
    this.game.client.sendOnHit(player.id);
    this.game.sounds.hit.play();
  }

  handleOtherBullets(bullet, player) {
    if(bullet.playerID===player.id) return;

    bullet.kill();
    this.resetVelocity(player);
  }

  resetVelocity(player) {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
  }

  collideChest(player, chest) {
    this.game.client.sendPickupChest(chest.id);
    chest.kill();
  }
}

export default CollisionHandler