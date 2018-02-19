import Client from '../services/Client'
import GameObjectHandler from '../services/GameObjectHandler'
import CollisionHandler from '../services/CollisionHandler'
import _ from 'lodash'

class Game extends Phaser.State {
  constructor() {
    super();

    this.myID = -1;
    this.moveSpeed = 50;
    this.gameObjectHandler = new GameObjectHandler(this);
    this.collisionHandler = new CollisionHandler(this);

    this.tmrShootLeft = 0;
    this.tmrShootRight = 0;
    this.tmrGetChest = 0;

    this.sounds = {};
  }

  init(args) {
    this.client = new Client(this, args.name);    
  }

  preload() {
    this.stage.disableVisibilityChange = true;
    this.load.image('sprite', 'assets/sprites/boat1.png');
    this.load.image('sea', 'assets/sprites/mspaintblue.png');
    this.load.image('foam', 'assets/particles/foam.png');
    this.load.image('smoke', 'assets/particles/smoke.png');      
    this.load.image('cannonball', 'assets/sprites/cannonball.png');  
    this.load.image('island', 'assets/sprites/island1.png'); 
    this.load.image('x', 'assets/sprites/xmarksthespot.png');           
    
    this.load.spritesheet('waves', 'assets/sprites/waves.png', 100, 100);
    this.load.spritesheet('floating chest', 'assets/sprites/floatingchest.png', 100, 100);
    this.load.spritesheet('explosions', 'assets/sprites/explosion.png', 100, 100);
    
    this.load.audio('shoot', 'assets/audio/shoot.wav');
    this.load.audio('hit', 'assets/audio/hit.wav');    
    this.load.audio('hurt', 'assets/audio/hurt.wav');
    this.load.audio('coins', 'assets/audio/coins.wav');    
  }

  create() {
    let worldSize = 4096;
    let bound = 10;
    this.add.tileSprite(bound, bound, worldSize-bound*2, worldSize-bound*2, 'sea');
    this.world.setBounds(0, 0, worldSize, worldSize);
    this.stage.backgroundColor = '#276ace';
    
    // randomly positioned waves
    let waves = this.add.group();
    for(let i = 0; i < 100; i++) {
      let randX = Math.floor(Math.random() * worldSize);
      let randY = Math.floor(Math.random() * worldSize);
      waves.create(randX, randY, 'waves');
    }
    waves.callAll('animations.add', 'animations', 'waves', [0,1,2,3,4], 7, true);
    waves.callAll('play', null, 'waves');
    
    // testing explosion
    let explosions = this.add.group();
    explosions.create(200, 200, 'explosions');
    explosions.callAll('animations.add', 'animations', 'explosions', [0,1,2,3,4,5], 15, true);
    explosions.callAll('play', null, 'explosions');

    // sounds
    this.sounds.shoot = this.add.audio('shoot');
    this.sounds.hit = this.add.audio('hit');    
    this.sounds.hurt = this.add.audio('hurt');    
    this.sounds.coins = this.add.audio('coins');

    // progress bar
    this.progressBack = new Phaser.Rectangle(this.game.width/2-50, this.game.height/2-10, 100, 20);
    this.progress = new Phaser.Rectangle(this.game.width/2-50, this.game.height/2-10, 100, 20);    
    
    this.gameObjectHandler.create();
    this.client.requestJoin();
  }

  update() {
    this.gameObjectHandler.players.children.forEach(player => {
      // foam fadeout      
      let emitter = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.foamEmitters.children, player.id);
      emitter.forEachAlive(p => {
        //p.alpha = p.lifespan / emitter.lifespan;	
        if(player.island) p.alpha = 0;
      });

      let smoke = player.getChildAt(1);
      if(smoke) {
        smoke.forEachAlive(p => {
          if(p.lifespan < emitter.lifespan*0.75) p.alpha = 0.5 + (p.lifespan / emitter.lifespan);
        });
      }

      // other players' bullets
      if(player.id!==this.myID) {
        let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);        
        this.physics.arcade.collide(weapon.bullets, this.gameObjectHandler.players, this.collisionHandler.handleOtherBullets, null, this.collisionHandler);        
      }
    });

    let player = this.getMe();   
    if(!player) return;   

    // local player's bullets
    let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);
    this.physics.arcade.collide(weapon.bullets, this.gameObjectHandler.players, this.collisionHandler.hitPlayer, null, this.collisionHandler);

    // local player and chests
    this.physics.arcade.collide(player, this.gameObjectHandler.chests, this.collisionHandler.collideChest, null, this.collisionHandler);
    
    // islands
    // player.island = null;
    this.physics.arcade.collide(player, this.gameObjectHandler.islands, this.collisionHandler.collideIsland, null, this.collisionHandler); 
    
    // docking
    if(player.island) {
      let timeToGrab = 3;
      
      this.tmrGetChest+=this.time.physicsElapsed;
      this.progress.width = ((timeToGrab-this.tmrGetChest) / timeToGrab) * this.progressBack.width;      

      if(this.tmrGetChest>=timeToGrab) {
        this.collisionHandler.collideChest(player, player.tempChest);
        this.tmrGetChest = 0;
        player.island = null;
      }
    } else {
      this.tmrGetChest = 0;
    }

    // input
    this.handleInput(player);

    // foam position
    this.gameObjectHandler.anchorFoamEmitter(player, player.x, player.y);
  }

  render() {
    // this.gameObjectHandler.chests.forEach(chest => {
    //   this.game.debug.body(chest);
    // });

    // this.gameObjectHandler.islands.forEach(island => {
      // this.game.debug.body(island);
    // });

    if(this.getMe() && this.getMe().island) {
      this.game.debug.geom(this.progressBack, '#222');
      this.game.debug.geom(this.progress, '#44ff44');
    } else {
      this.game.debug.reset();
    }
  }

  getMe() {
    return _.find(this.gameObjectHandler.players.hash, {id: this.myID});    
  }

  handleInput(player) {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;
    
    if(!player.island) {
      if(this.input.keyboard.isDown(Phaser.KeyCode.A)) {
        player.body.angularVelocity = -this.moveSpeed; 
      }
    
      if(this.input.keyboard.isDown(Phaser.KeyCode.D)) { 
        player.body.angularVelocity = this.moveSpeed;  
      }
    } else {
      let tween = this.game.add.tween(player);    
      tween.to({ angle: Math.ceil((player.angle)/90) * 90 }, 100);
      tween.start();
    }
    
    // shooting timers
    let shootDelay = 0.8;
    this.tmrShootLeft+=this.time.physicsElapsed;
    this.tmrShootRight+=this.time.physicsElapsed;
    
    if(this.tmrShootLeft>=shootDelay) {
      this.gameObjectHandler.ui.lReload.visible = false;      
      if(this.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {  
        this.smoke(player, -80);      
          
        this.fire(player, 'left');  
        this.tmrShootLeft = 0;       
        this.gameObjectHandler.ui.lReload.visible = true;                    
      }
    }

    if(this.tmrShootRight>=shootDelay) {
      this.gameObjectHandler.ui.rReload.visible = false;
      if(this.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
        this.smoke(player, 80);
        
        this.fire(player, 'right');    
        this.tmrShootRight = 0; 
        this.gameObjectHandler.ui.rReload.visible = true;     
      }
    }

    // wind bonus
    let windDiff = Math.abs((player.angle-90) - Number(this.gameObjectHandler.ui.windText.text.split(': ')[1]));

    // move
    if(!player.island) this.physics.arcade.velocityFromAngle(player.angle-90, (this.moveSpeed * 2), player.body.velocity);    
    if(!this.posInterval) {
      this.posInterval = setInterval(() => {
        this.client.sendMove(player.x, player.y, player.angle); 
      }, 50);
    }  
    
    // progress bar
    let y = player.y + 150;
    this.progressBack.centerOn(player.x, y);    
    this.progress.centerOn(player.x, y);
  }

  fire(player, gun) {
    let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);
    if(!weapon) return;

    weapon.fireAngle = gun === 'left' ? player.angle-180 : player.angle+360;      
    weapon.fire();
    if(player.id===this.myID) {
      this.client.sendFire(gun);
      this.sounds.shoot.play();
    } else {
      this.smoke(player, gun === 'left' ? -80 : 80);
    }
  }

  smoke(player, x, delay) {
    let smoke = player.getChildAt(1);
    if(!smoke) return;

    setTimeout(() => {
      smoke.x = x;        
      smoke.start(true, 800, null, 20);
    }, delay ? delay : 50);
  }

  onHit(victim, health) {
    let player = this.gameObjectHandler.getPlayer(victim);
    player.health = health;
    player.tint = this.gameObjectHandler.rgbToHex(player.health);  
    this.smoke(player, 0, 0);   

    if(player.id===this.myID) {
      this.camera.flash(0xff0000, 500);
      this.sounds.hurt.play();      
    }    
  }
}

export default Game