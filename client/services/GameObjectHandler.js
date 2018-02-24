import Game from '../states/Game'
import _ from 'lodash'

class GameObjectHandler {
  constructor(game) {
    this.game = game;
    this.players;
    this.foamEmitters;    
    this.weapons = [];
    this.ui;
    this.chests;
    this.islands;
    this.explosions;
  }

  create() {
    this.players = this.game.add.group();
    this.foamEmitters = this.game.add.group();    
    this.ui = this.game.add.group();
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

    if(this.getGroupChild(this.ui, 'leaderboard')) this.updateLeaderboard();    
    this.sortLayers();                   
  }

  getGroupChild(group, id, array) {
    return _.find(array ? group : group.children, {playerID: id});
  }

  addName(player) {
    let name = this.game.add.text(0, 110, player.name, { font: "30px Arial", fill: "#ffffff", align: "left" });
    name.x = name.x - name.width/2;
    player.addChild(name);
  }

  addFoamEmitter(player) {
    let foamEmitter = this.game.add.emitter(player.x, player.y, 200);
    foamEmitter.makeParticles('foam');
    foamEmitter.gravity = 0;
    foamEmitter.setXSpeed(0);
    foamEmitter.setScale(0.5, 0.5, 0.5, 0.5);    
    // foamEmitter.start(false, 2000, 100);
    foamEmitter.playerID = player.id;    
    this.foamEmitters.add(foamEmitter);    
  }

  anchorFoamEmitter(player, x, y) {
    this.getGroupChild(this.foamEmitters, player.id).x = x;
    this.getGroupChild(this.foamEmitters, player.id).y = y-20;    
  }

  addSmokeEmitter(player) {
    let smokeEmitter = this.game.add.emitter(0, 0, 100);
    smokeEmitter.makeParticles('smoke');
    player.addChild(smokeEmitter);
  }

  addSmoke(player, x, delay) {
    let smoke = player.getChildAt(1);
    if(!smoke) return;

    smoke.x = x;        
    // smoke.start(true, 800, null, 20);
  }

  addWeapon(player) {
    let weapon = this.game.add.weapon(-1, 'cannonball');
    weapon.bulletSpeed = 300;
    weapon.fireRate = 0;
    weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
    weapon.bulletKillDistance = this.game.game.width;
    weapon.trackSprite(player);   
    weapon.onFire.add(this.onFire);
    weapon.playerID = player.id;
    this.weapons.push(weapon);
  }

  onFire(bullet, weapon) {
    bullet.playerID = weapon.playerID;
  }

  addUI() {
    let windText = this.addText(30, 30, "Wind direction: 0");
    windText.visible = false;
    windText.playerID = 'wind';
    this.ui.add(windText);

    let goldText = this.addText(30, 30, "Your Gold: 0", null, "#ffcf35");
    goldText.playerID = 'gold';    
    this.ui.add(goldText);    

    let lReload = this.game.add.sprite(30, this.game.game.height-60, 'lcannon');
    lReload.fixedToCamera = true;
    lReload.playerID = 'lreload';    
    this.ui.add(lReload);        
    
    let rReload = this.game.add.sprite(this.game.game.width-30-47, this.game.game.height-60, 'rcannon');
    rReload.fixedToCamera = true;
    rReload.playerID = 'rreload';        
    this.ui.add(rReload);        
    
    let leaderboard = this.addText(30, 90, "", "left");
    leaderboard.playerID = 'leaderboard';        
    this.ui.add(leaderboard);        
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
    let text = this.getGroupChild(this.ui, 'wind');
    if(text) text.setText("Wind direction: " + wind);
  }

  updateGold(gold) {
    let text = this.getGroupChild(this.ui, 'gold');    
    if(text) text.setText("Your Gold: " + gold + "g");
  }

  updateLeaderboard() {
    let leaderboard = this.getGroupChild(this.ui, 'leaderboard');
    let text = "Wanted:";
    _.sortBy(this.players.children, 'gold').reverse().forEach(p => {
      text += "\n" + p.name + ": " + p.gold + "g";
    });
    leaderboard.setText(text);
  }

  movePlayer(id, x, y, angle) {
    let player = this.getPlayer(id);
    if(!player) return;

    // update foam position
    this.anchorFoamEmitter(player, x, y);  
  
    if(player.renderable) {
      let tween = this.game.add.tween(player);    
      tween.to({ x, y }, 100);
      tween.start();
    } else {
      player.x = x;
      player.y = y;
      player.renderable = true;
    }

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;
    player.angle = angle;     
  }

  removePlayer(id) {
    if(!this.getPlayer(id)) return;

    this.getGroupChild(this.foamEmitters, id).destroy();
    this.getPlayer(id).destroy();    

    // destroy their weapon
    // this.getGroupChild(this.weapons, id).destroy();
    // delete this.getPlayerChild(this.weapons, id);

    // update the leaderboards
    let leaderboard = this.getGroupChild(this.ui, 'leaderboard');
    if(leaderboard) this.updateLeaderboard();        
  }

  onDeath(data) {
    let player = this.getPlayer(data.id);
    if(!player) return;

    player.health = data.health;
    player.tint = this.rgbToHex(player.health);
    player.gold = data.gold;
    player.x = data.x;
    player.y = data.y;
    this.updateLeaderboard();

    if(player.id===this.game.myID) {
      player.island = null;      
      this.updateGold(player.gold);

      setTimeout(() => {
        player.renderable = true;
      }, 500);
    }
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
    this.game.world.bringToTop(this.ui);   
  }

  pickupChest(data) {
    let player = this.getPlayer(data.playerID);
    player.gold+=data.chest.gold;   
    player.health=data.health;
    player.tint = this.rgbToHex(data.health); 

    if(data.playerID===this.game.myID) {
      this.game.gameObjectHandler.updateGold(player.gold);
      this.game.sounds.coins.play();
    } else {
      let me = this.getPlayer(this.game.myID);
      if(me && me.chest && me.chest.id===data.chest.id) {
        me.island = null;
      }
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
    island.body.setSize(200, 200, 50, 50);

    this.islands.add(island);
  }

  addExplosion(x, y) {
    let exp = this.explosions.create(x-50, y-50, 'explosions');
    exp.animations.add('explosions', [0,1,2,3,4,5], 15, true);
    exp.play('explosions', null, false, true);
    this.game.world.bringToTop(this.explosions);
  }
}

export default GameObjectHandler