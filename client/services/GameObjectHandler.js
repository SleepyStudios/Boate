import Game from '../states/Game'
import _ from 'lodash'

class GameObjectHandler {
  constructor(game) {
    this.game = game;
    this.players;
    this.foamEmitters;
    this.weapons = [];
    this.ui = {};
    this.uiGroup;
    this.chests;
    this.islands;
    this.explosions;
  }

  create() {
    this.players = this.game.add.group();
    this.foamEmitters = this.game.add.group();
    this.uiGroup = this.game.add.group();
    this.chests = this.game.add.group();
    this.islands = this.game.add.group();  
    this.explosions = this.game.add.group();  
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
    player.body.setSize(150, 150, 52/2, 63/2);

    // could probably be done better with spread operator but im dumb
    player.health = data.health;
    player.tint = this.rgbToHex(player.health);
    player.name = data.name;
    player.gold = data.gold;

    this.addName(player);
    this.addFoamEmitter(player);
    this.addSmokeEmitter(player);
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
    foam.setScale(0.5, 0.5, 0.5, 0.5);    
    foam.start(false, 2000, 40);
    foam.playerID = player.id;
    this.foamEmitters.add(foam);
  }

  anchorFoamEmitter(player, x, y) {
    this.getPlayerChild(this.foamEmitters.children, player.id).x = x;
    this.getPlayerChild(this.foamEmitters.children, player.id).y = y;    
  }

  addSmokeEmitter(player) {
    let smokeEmitter = this.game.add.emitter(0, 0, 100);
    smokeEmitter.makeParticles('smoke');
    player.addChild(smokeEmitter);
  }

  addWeapon(player) {
    let weapon = this.game.add.weapon(-1, 'cannonball');
    weapon.bulletSpeed = 300;
    weapon.fireRate = 0;
    weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
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
    this.ui.windText.visible = false;
    this.ui.goldText = this.addText(30, 30, "Your Gold: 0", null, "#ffcf35");

    this.ui.lReload = this.game.add.sprite(30, this.game.game.height-60, 'lcannon');
    this.ui.lReload.fixedToCamera = true;
    
    this.ui.rReload = this.game.add.sprite(this.game.game.width-30-47, this.game.game.height-60, 'rcannon');
    this.ui.rReload.fixedToCamera = true;
    
    this.ui.leaderboard = this.addText(30, 90, "", "left");
    
    Object.values(this.ui).forEach(i => {
      this.uiGroup.add(i);
    })
  }

  addText(x, y, text, align, colour) {
    let uiText = this.game.add.text(0, 0, text, {
      font: "18px Arial",
      fill: colour ? colour : "#fff",
      align: align ? align : "center"
    });
    uiText.fixedToCamera = true;
    uiText.cameraOffset = new Phaser.Point(x, y);
    return uiText;
  }

  updateWind(wind) {
    if(this.ui.windText) this.ui.windText.setText("Wind direction: " + wind);
  }

  updateGold(gold) {
    if(this.ui.goldText) this.ui.goldText.setText("Your Gold: " + gold + "g");
  }

  updateLeaderboard() {
    let text = "Wanted:";
    _.sortBy(this.players.children, 'gold').reverse().forEach(p => {
      text += "\n" + p.name + ": " + p.gold + "g";
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

    // destroy their foam emitter
    this.getPlayerChild(this.foamEmitters.children, id).destroy();
    delete this.getPlayerChild(this.foamEmitters.children, id);

    this.players.remove(this.getPlayer(id), true);    
    // delete this.getPlayer(id);    

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
    let chest = this.game.add.sprite(data.x, data.y, data.onIsland ? 'x' : 'floating chest');
    chest.id = data.id;    
    chest.gold = data.gold;
    this.game.physics.arcade.enable(chest);   

    if(!data.onIsland) {
      chest.body.setSize(40, 40, 30, 35);     
    } else {
      chest.body.setSize(40, 40, 122, 102);     
    }

    chest.animations.add('float', [0, 1, 2, 3, 4], 7, true);
    chest.play('float');

    this.chests.add(chest); 
    this.sortLayers();               
  }

  sortLayers() {
    this.game.world.bringToTop(this.chests);
    this.game.world.bringToTop(this.players);    
    this.game.world.bringToTop(this.uiGroup);   
  }

  pickupChest(data) {
    let player = this.getPlayer(data.playerID);
    player.gold+=data.chest.gold;    

    if(data.playerID===this.game.myID) {
      this.game.gameObjectHandler.updateGold(player.gold);
      this.game.sounds.coins.play();
    }

    this.chests.children.forEach(chest => {
      if(chest.id===data.chest.id) chest.kill();
    });

    this.updateLeaderboard();
  }

  addIsland(data) {
    let island = this.game.add.sprite(data.x, data.y, 'island');
    island.id = data.id;    
    // island.anchor.setTo(0.5, 0.5);    
    // island.angle = data.angle;
    this.game.physics.arcade.enable(island);       
    island.body.immovable = true;
    island.body.setSize(220, 220, 40, 40);

    this.islands.add(island);
  }

  addSmoke(player, x, delay) {
    let smoke = player.getChildAt(1);
    if(!smoke) return;

    setTimeout(() => {
      smoke.x = x;        
      smoke.start(true, 800, null, 20);
    }, delay ? delay : 50);
  }

  addExplosion(x, y) {
    let exp = this.explosions.create(x-50, y-50, 'explosions');
    exp.animations.add('explosions', [0,1,2,3,4,5], 15, true);
    exp.play('explosions', null, false, true);
    this.game.world.bringToTop(this.explosions);
  }
}

export default GameObjectHandler