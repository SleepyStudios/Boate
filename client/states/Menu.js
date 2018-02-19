class Menu extends Phaser.State {
  constructor() {
    super();

    this.name;
  }

  preload() {
    this.load.image('sea', 'assets/sprites/mspaintblue.png');
  }

  create() {
    this.add.plugin(PhaserInput.Plugin);  
    
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'sea');

    let text = this.add.text(this.world.centerX, this.world.centerY, "BOAT.IO!\nENTER A NAME YE SCURVY DOG\n", {
      font: "36px Arial",
      fill: "#fff",
      align: "center"
    });
    text.anchor.setTo(0.5, 0.5);

    this.name = this.add.inputField(this.world.centerX-100, this.world.centerY+100, {
      font: '18px Arial',
      width: 200,
      height: 18,
      padding: 10,
      max: "10"
    });
  }

  update() {
    if(this.input.keyboard.isDown(Phaser.KeyCode.ENTER)) { 
      if(this.name.value.length>0) {
        this.state.start('Game', true, false, {name: this.name.value});
      }
    }
  }

  render() {
  }
}

export default Menu