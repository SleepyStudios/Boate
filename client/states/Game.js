import Client from '../services/Client'
import GameObjectHandler from '../services/GameObjectHandler'
import _ from 'lodash'

class Game extends Phaser.State {
  constructor() {
    super();

    this.myID = -1;
    this.moveSpeed = 30;
    this.gameObjectHandler = new GameObjectHandler(this);

    this.tmrShootLeft = 0;
    this.tmrShootRight = 0;
  }

  init(args) {
    this.client = new Client(this, args.name);    
  }

  preload() {
    this.stage.disableVisibilityChange = true;
    this.load.image('sprite', 'assets/sprites/boat1.png');
    this.load.image('sea', 'assets/sprites/mspaintblue.png');
    this.load.spritesheet('waves', 'assets/sprites/waves.png', 100, 100);
    this.load.image('foam', 'assets/particles/foam.png'); 
    this.load.image('cannonball', 'assets/sprites/cannonball.png');           
  }

  create() {
    let worldSize = 4096;
    let bound = 10;
    this.add.tileSprite(bound, bound, worldSize-bound*2, worldSize-bound*2, 'sea');
    this.world.setBounds(0, 0, worldSize, worldSize);
    
    // randomly positioned waves
    let waves = this.add.group();
    for(var i = 0; i < 100; i++) {
      var randX = Math.floor(Math.random() * worldSize);
      var randY = Math.floor(Math.random() * worldSize);
      waves.create(randX, randY, 'waves');
    }
    waves.callAll('animations.add', 'animations', 'waves', [0,1,2,3,4], 7, true);
    waves.callAll('play', null, 'waves');
    
    this.gameObjectHandler.create();
    this.client.requestJoin();
  }

  update() {
    this.gameObjectHandler.players.children.forEach(player => {
      // foam fadeout      
      let emitter = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.foamEmitters.children, player.id);
      emitter.forEachAlive(p => {
        p.alpha = p.lifespan / emitter.lifespan;	
      });

      // other players' bullets
      if(player.id!==this.myID) {
        let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);        
        this.physics.arcade.collide(weapon.bullets, this.gameObjectHandler.players, this.gameObjectHandler.handleOtherBullets, null, this);        
      }
    });

    let player = this.getMe();   
    if(!player) return;   

    // local player's bullets
    let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);
    this.physics.arcade.collide(weapon.bullets, this.gameObjectHandler.players, this.gameObjectHandler.hitPlayer, null, this);

    // input
    this.handleInput(player);

    // foam position
    this.gameObjectHandler.anchorFoamEmitter(player, player.x, player.y);
  }

  render() {
  }

  getMe() {
    return _.find(this.gameObjectHandler.players.hash, {id: this.myID});    
  }

  handleInput(player) {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;
    
    if(this.input.keyboard.isDown(Phaser.KeyCode.A)) {
      player.body.angularVelocity = -this.moveSpeed; 
    }
  
    if(this.input.keyboard.isDown(Phaser.KeyCode.D)) { 
      player.body.angularVelocity = this.moveSpeed;  
    }
    
    // shooting timers
    let shootDelay = 0.8;
    this.tmrShootLeft+=this.time.physicsElapsed;
    this.tmrShootRight+=this.time.physicsElapsed;
    
    if(this.tmrShootLeft>=shootDelay) {
      if(this.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {    
        this.fire(player, player.angle-180);  
        this.tmrShootLeft = 0;                   
      }
    }

    if(this.tmrShootRight>=shootDelay) {
      if(this.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
        this.fire(player, player.angle+360);    
        this.tmrShootRight = 0; 
      }
    }

    // wind bonus
    let windDiff = Math.abs((player.angle-90) - Number(this.gameObjectHandler.windText.text.split(': ')[1]));
    console.log(windDiff);

    // move
    this.physics.arcade.velocityFromAngle(player.angle-90, (this.moveSpeed * 2) + windDiff, player.body.velocity);    
    if(!this.posInterval) {
      this.posInterval = setInterval(() => {
        this.client.sendMove(player.x, player.y, player.angle); 
      }, 50);
    }   
  }

  fire(player, angle) {
    let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);
    weapon.fireAngle = angle;     
    weapon.fire();
    if(player.id===this.myID) this.client.sendFire(angle);
  }

  onHit(victim, health) {
    let player = this.gameObjectHandler.getPlayer(victim);
    player.health = health;
    player.tint = this.gameObjectHandler.rgbToHex(player.health);     

    if(player.id===this.myID) this.camera.flash(0xff0000, 500);    
  }
}

export default Game