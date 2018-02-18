import Client from '../services/Client'
import GameObjectHandler from '../services/GameObjectHandler'
import _ from 'lodash'

class Game extends Phaser.State {
  constructor() {
    super();

    this.client = new Client(this);
    this.myID = -1;
    this.moveSpeed = 30;
    this.gameObjectHandler = new GameObjectHandler(this);
  }

  preload() {
    this.stage.disableVisibilityChange = true;
    this.load.image('sprite', 'assets/sprites/boat1.png');
    this.load.image('sea', 'assets/sprites/mspaintblue.png');
    this.load.image('foam', 'assets/particles/foam.png'); 
    this.load.image('cannonball', 'assets/sprites/cannonball.png');           
  }

  create() {
    let worldSize = 4096;
    this.add.tileSprite(0, 0, worldSize, worldSize, 'sea');
    this.world.setBounds(0, 0, worldSize, worldSize);  

    this.gameObjectHandler.create();
    this.client.requestJoin();
  }

  update() {
    // foam fadeout
    this.gameObjectHandler.players.children.forEach(player => {
      let emitter = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.foamEmitters.children, player.id);
      emitter.forEachAlive(p => {
        p.alpha = p.lifespan / emitter.lifespan;	
      });
    });

    let player = this.getMe();   
    if(!player) return;   

    // this.physics.arcade.collide(player, this.gameObjectHandler.players, this.gameObjectHandler.handleCollision, null, this);

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
    
    if(this.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {    
      this.fire(player, player.angle-180);             
    }

    if(this.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
      this.fire(player, player.angle+360);     
    }

    this.physics.arcade.velocityFromAngle(player.angle-90, this.moveSpeed, player.body.velocity);       
    this.client.sendMove(player.x, player.y, player.angle); 
  }

  fire(player, angle) {
    let weapon = this.gameObjectHandler.getPlayerChild(this.gameObjectHandler.weapons, player.id);
    weapon.fireAngle = angle;     
    weapon.fire();
    if(player.id===this.myID) this.client.sendFire(angle);
  }
}

export default Game