import Game from '../states/Game'
import _ from 'lodash'

class GameObjectHandler {
  constructor(game) {
    this.game = game;
    this.players;
    this.foamEmitters;
    this.weapons = [];
    this.ui = {};
    this.chests;
  }

  create() {
    this.players = this.game.add.group();
    this.foamEmitters = this.game.add.group();
    this.chests = this.game.add.group();
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

    // could porbably be done better with spread operator but im dumb
    player.health = data.health;
    player.tint = this.rgbToHex(player.health);
    player.name = data.name;
    player.gold = data.gold;

    this.addName(player);
    this.addFoamEmitter(player);
    this.addWeapon(player);  

    this.players.add(player);
    this.game.world.bringToTop(this.players);  

    // if it's the local player
    if(data.id===this.game.myID) {
      this.addUI();      
      this.updateGold(player.gold);

      this.game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);  
    }

    if(this.ui.leaderboard) this.updateLeaderboard();    
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
    this.ui.windText = this.addText(30, 30, "Wind direction: 0");
    this.ui.goldText = this.addText(30, 60, "Gold: 0");

    this.ui.lReload = this.addText(30, this.game.game.height-60, "L Reloading");
    this.ui.lReload.visible = false;
    this.ui.rReload = this.addText(this.game.game.width-230, this.game.game.height-60, "R Reloading");
    this.ui.rReload.visible = false;  
    
    this.ui.leaderboard = this.addText(30, 120, "", "left");
  }

  addText(x, y, text, align) {
    let uiText = this.game.add.text(0, 0, text, {
      font: "18px Arial",
      fill: "#fff",
      align: align ? align : "center"
    });
    uiText.fixedToCamera = true;
    uiText.cameraOffset = new Phaser.Point(x, y);
    return uiText;
  }

  updateWind(wind) {
    this.ui.windText.setText("Wind direction: " + wind);
  }

  updateGold(gold) {
    this.ui.goldText.setText("Gold: " + gold);
  }

  updateLeaderboard() {
    let text = "Leaderboard:";
    this.players.children.forEach(p => {
      text += "\n" + p.name;
    });
    this.ui.leaderboard.setText(text);
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

    // destroy their weapon
    // this.getPlayerChild(this.weapons, id).destroy();
    // delete this.getPlayerChild(this.weapons, id);

    // update the leaderboards
    if(this.ui.leaderboard) this.updateLeaderboard();        
  }

  rgbToHex(health) {
    let h = (health / 100) * 255;

    return h << 16 | h << 8 | h;
  }

  addChest(data) {
    let chest = this.game.add.sprite(data.x, data.y, 'chest');
    chest.gold = data.gold;
    this.game.physics.arcade.enable(chest);    
    this.chests.add(chest);
  }
}

export default GameObjectHandler