import Game from '../states/Game'
import _ from 'lodash'

class GameObjectHandler {
  constructor(game) {
    this.game = game;
    this.players;
    this.foamEmitters;
    this.weapons = [];
    this.windText = null;
  }

  create() {
    this.players = this.game.add.group();
    this.foamEmitters = this.game.add.group();
  }

  getPlayer(id) {
    if(!this.players) return null;
    return _.find(this.players.children, {id: id});
  }
  
  addPlayer(data) {
    let sprite = this.game.add.sprite(data.x, data.y, 'sprite');
    let player = Object.assign(sprite, {id: data.id});
    this.game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.anchor.setTo(0.5, 0.5);
    player.health = data.health;
    player.tint = this.rgbToHex(player.health);
    player.name = data.name;

    this.addName(player);
    this.addFoamEmitter(player);
    this.addWeapon(player);  
    this.addUI();

    this.players.add(player);
    this.game.world.bringToTop(this.players);  

    // if it's them
    if(data.id===this.game.myID) {
      this.game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);  
    }
  }

  getPlayerChild(group, id) {
    return _.find(group, {playerID: id});
  }

  addName(player) {
    let name = this.game.add.text(0, 110, player.name, { font: "30px Arial", fill: "#ffffff", align: "left" });
    name.x = name.x - name.width/2;
    player.addChild(name);
  }

  addFoamEmitter(player) {
    let foam = this.game.add.emitter(player.x, player.y, 200);
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
    weapon.fireRate = 0;
    weapon.trackSprite(player);   
    weapon.onFire.add(this.onFire);
    weapon.playerID = player.id;
    this.weapons.push(weapon);
  }

  onFire(bullet, weapon) {
    bullet.playerID = weapon.playerID;
  }

  addUI() {
    this.windText = this.game.add.text(0, 0, "Wind direction: 0", {
      font: "36px Arial",
      fill: "#fff",
      align: "center"
    });
    this.windText.fixedToCamera = true;
    this.windText.cameraOffset = new Phaser.Point(30, 30);
  }

  movePlayer(id, x, y, angle) {
    let player = this.getPlayer(id);
    if(!player) return;

    let distance = Phaser.Math.distance(player.x, player.y, x, y);
    let duration = 100;
    let tween = this.game.add.tween(player);

    // update foam position
    this.anchorFoamEmitter(player, x, y);     

    tween.to({ x, y }, duration);
    tween.start();

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;
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
    this.client.sendOnHit(player.id);
  }

  handleOtherBullets(bullet, player) {
    if(bullet.playerID===player.id) return;
    bullet.kill();
  }

  rgbToHex(health) {
    let h = (health / 100) * 255;

    return h << 16 | h << 8 | h;
  }
}

export default GameObjectHandler