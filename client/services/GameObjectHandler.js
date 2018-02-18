import Game from '../states/Game'
import _ from 'lodash'

class GameObjectHandler {
  constructor(game) {
    this.game = game;
    this.players;
    this.foamEmitters;
    this.weapons = [];
  }

  create() {
    this.players = this.game.add.group();
    this.foamEmitters = this.game.add.group();
  }

  getPlayer(id) {
    if(!this.players) return null;
    return _.find(this.players.children, {id: id});
  }
  
  addPlayer(id, x, y) {
    let sprite = this.game.add.sprite(x, y, 'sprite');
    let player = Object.assign(sprite, {id: id});
    this.game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.anchor.setTo(0.5, 0.5);

    this.addFoamEmitter(player);
    this.addWeapon(player);  

    this.players.add(player);
    this.game.world.bringToTop(this.players);  

    // if it's them
    if(id===this.game.myID) {
      this.game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);  
    }
  }

  getPlayerChild(group, id) {
    return _.find(group, {playerID: id});
  }

  addFoamEmitter(player) {
    let foam = this.game.add.emitter(0, 0, 200);
    foam.makeParticles('foam');
    foam.gravity = 0;
    foam.setXSpeed(0);      
    foam.start(false, 2000, 60);
    foam.playerID = player.id;
    this.foamEmitters.add(foam);
  }

  anchorFoamEmitter(player, x, y) {
    this.getPlayerChild(this.foamEmitters.children, player.id).x = x;
    this.getPlayerChild(this.foamEmitters.children, player.id).y = y;    
  }

  addWeapon(player) {
    let weapon = this.game.add.weapon(-1, 'cannonball');
    weapon.bulletSpeed = 300;
    weapon.fireRate = 500;
    weapon.trackSprite(player);   
    weapon.playerID = player.id;
    this.weapons.push(weapon);
  }

  movePlayer(id, x, y, angle) {
    let player = this.getPlayer(id);
    if(!player) return;

    let distance = Phaser.Math.distance(player.x, player.y, x, y);
    let duration = this.game.moveSpeed;
    let tween = this.game.add.tween(player);

    // update foam position
    this.anchorFoamEmitter(player, x, y);     

    tween.to({ x, y }, duration);
    tween.start();

    player.angle = angle;
  }

  removePlayer(id) {
    if(!this.getPlayer(id)) return;

    this.getPlayer(id).destroy();
    delete this.getPlayer(id);

    // destroy their foam emitter
    this.getPlayerChild(this.foamEmitters.children, id).destroy();
    delete this.getPlayerChild(this.foamEmitters.children, id);
  }

  hitPlayer(bullet, player) {
    if(player.id===this.game.myID) return;
    bullet.kill();
    this.game.camera.flash(0xffffff, 500);
  }
}

export default GameObjectHandler