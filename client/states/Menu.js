class Menu extends Phaser.State {
  constructor() {
    super();

    this.intro = "BOAT.IO!"
    this.name;
    this.oldName = "";
    this.music;
  }

  init(args) {
    if(!args) return;
    this.intro = args.intro;
    this.oldName = args.name;
  }

  preload() {
    this.load.image('sea', 'assets/sprites/mspaintblue.png');
    this.add.plugin(PhaserInput.Plugin);  
    this.load.audio('music', 'assets/audio/music.mp3');    
  }

  create() {
    if(!this.music) this.music = this.add.audio('music', 0.4, true);
    this.music.play();

    this.world.setBounds(0, 0, this.game.width, this.game.height);
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'sea');

    let text = this.add.text(this.world.centerX, this.world.centerY, this.intro + "\nENTER A NAME YE SCURVY DOG\n(press enter twice for now)", {
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
      max: "10",
      placeHolder: "Your name"
    });
    this.name.setText(this.oldName);
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