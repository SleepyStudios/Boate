import Client from '../services/Client'
import GameObjectHandler from '../services/GameObjectHandler'

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
  }

  create() {
    let worldSize = 4096;
    this.add.tileSprite(0, 0, worldSize, worldSize, 'sea');
    this.world.setBounds(0, 0, worldSize, worldSize);  
    
    this.foam = this.add.emitter(0, 0, 200);
    this.foam.makeParticles('foam');
    this.foam.gravity = 0;
    this.foam.setXSpeed(0);      
    this.foam.start(false, 2000, 60);

    this.gameObjectHandler.create();
    this.client.requestJoin();
  }

  update() {
    let player = this.gameObjectHandler.getPlayer(this.myID);   
    if(!player) return;    

    // this.physics.arcade.collide(player, this.gameObjectHandler.players, this.gameObjectHandler.handleCollision, null, this);

    // foam fadeout
    this.foam.forEachAlive(p => {
      p.alpha = p.lifespan / this.foam.lifespan;	
    });

    this.handleInput(player);

    // foam position
    this.foam.x = player.x;
    this.foam.y = player.y;
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

    this.physics.arcade.velocityFromAngle(player.angle-90, this.moveSpeed, player.body.velocity);       
    this.client.sendMove(player.x, player.y, player.angle); 
  }
}

export default Game