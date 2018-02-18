import Client from '../services/Client'
import GameObjectHandler from '../services/GameObjectHandler'

class Game extends Phaser.State {
  constructor() {
    super();
    this.client = new Client(this);
    this.myID = -1;
    this.moveSpeed = 20;
    this.gameObjectHandler = new GameObjectHandler(this);
  }

  preload() {
    this.stage.disableVisibilityChange = true;
    this.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('tileset', 'assets/map/mspaintblue.png', 96, 96);
    this.load.image('sprite', 'assets/sprites/boat1.png');
    this.load.image('wake', 'assets/particles/white.png');
  }

  create() {
    let map = this.add.tilemap('map');    
    map.addTilesetImage('mspaintblue', 'tileset');    

    let layer = null;
    for(let i=0; i<map.layers.length; i++) layer = map.createLayer(i);

    this.world.setBounds(0, 0, 100000, 100000);     

    this.gameObjectHandler.create();
    this.client.requestJoin();
  }

  update() {
    let player = this.gameObjectHandler.getPlayer(this.myID);   
    if(!player) return;    
    
    // this.physics.arcade.collide(player, this.gameObjectHandler.players, this.gameObjectHandler.handleCollision, null, this);

    this.handleInput(player);
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