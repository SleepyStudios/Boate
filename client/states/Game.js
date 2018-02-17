import Client from '../services/Client'
import GameObjectHandler from '../services/GameObjectHandler'

class Game extends Phaser.State {
  constructor() {
    super();
    this.client = new Client(this);
    this.myID = -1;
    this.moveSpeed = 4;
    this.gameObjectHandler = new GameObjectHandler(this);
    this.emitter = null;
  }

  preload() {
    this.stage.disableVisibilityChange = true;
    this.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('tileset', 'assets/map/mspaintblue.png', 96, 96);
    this.load.image('sprite', 'assets/sprites/sprite.png');
    this.load.image('wake', 'assets/particles/white.png');
  }

  create() {
    let map = this.add.tilemap('map');    
    map.addTilesetImage('mspaintblue', 'tileset');    

    let layer = null;
    for(let i=0; i<map.layers.length; i++) layer = map.createLayer(i);

    this.world.setBounds(0, 0, 100000, 100000);   

    // wakes
    this.emitter = this.add.emitter(0, 0, 100);
    this.emitter.makeParticles('wake');
    this.emitter.setRotation(0, 0);
    this.emitter.setAlpha(0.6, 1);
    this.emitter.setScale(0.5, 0.5, 0.5, 0.5);
    this.emitter.gravity = 1000;
    // this.emitter.start(false, 2000, 20);   

    this.gameObjectHandler.create();
    this.client.requestJoin();
  }

  update() {
    let player = this.gameObjectHandler.getPlayer(this.myID);   
    if(!player) return;    
    
    // this.physics.arcade.collide(player, this.gameObjectHandler.players, this.gameObjectHandler.handleCollision, null, this);

    this.handleInput(player);

    this.emitter.x = player.x + 30;
    this.emitter.y = player.y + 20;
  }

  handleInput(player) {
    // let moved = false;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;
    let ang = 20;
    
    if(this.input.keyboard.isDown(Phaser.KeyCode.A)) {
      player.body.angularVelocity = -ang; 
    }
  
    if(this.input.keyboard.isDown(Phaser.KeyCode.D)) { 
      player.body.angularVelocity = ang;  
    }   

    // if(this.input.keyboard.isDown(Phaser.KeyCode.W)) { 
    this.physics.arcade.velocityFromAngle(player.angle-90, 100, player.body.velocity);       
    // }
    
    // if(moved) {
      this.client.sendMove(player.x, player.y, player.angle); 
    // }
  }
}

export default Game