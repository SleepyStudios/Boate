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
    this.load.image('cloud1', 'assets/sprites/cloud1.png');
    this.load.image('cloud2', 'assets/sprites/cloud2.png');
    this.load.image('cloud3', 'assets/sprites/cloud3.png');
    this.load.image('cloud4', 'assets/sprites/cloud4.png');
    this.load.spritesheet('waves', 'assets/sprites/waves.png', 100, 100);
    this.load.spritesheet('button', 'assets/buttons/button.png', 80, 50);
    this.add.plugin(PhaserInput.Plugin);  
    this.load.audio('music', 'assets/audio/citrus.mp3');    
  }

  create() {
    if(!this.music) this.music = this.add.audio('music', 0.4, true);
    this.music.play();

    this.world.setBounds(0, 0, this.game.width, this.game.height);
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'sea');
    
    // clouds
    this.cloud1 = this.add.sprite(200, 200, 'cloud1');
    this.cloud2 = this.add.sprite(100, 50, 'cloud2');
    this.cloud3 = this.add.sprite(900, 250, 'cloud3');
    this.cloud4 = this.add.sprite(400, 400, 'cloud4');
    this.cloud5 = this.add.sprite(600, 150, 'cloud2');
    this.cloud6 = this.add.sprite(100, 550, 'cloud3');
    this.cloud7 = this.add.sprite(1000, 500, 'cloud4');
    
    // randomly positioned waves
    let waves = this.add.group();
    for(let i = 0; i < 10; i++) {
      let randX = Math.floor(Math.random() * 1000);
      let randY = Math.floor(Math.random() * 800);
      waves.create(randX, randY, 'waves');
    }
    waves.callAll('animations.add', 'animations', 'waves', [0,1,2,3,4], 7, true);
    waves.callAll('play', null, 'waves');
    
    this.button = this.add.button(500, 400, 'button', this.joinGame(), this, 1, 0, 2, 0);

    //this.button.onInputOver.add(over, this);
    //this.button.onInputOut.add(out, this);
    //this.button.onInputUp.add(up, this);

    let text = this.add.text(this.world.centerX, this.world.centerY, this.intro + "\nENTER A NAME YE SCURVY DOG\n(press enter twice for now)", {
      font: "36px Arial",
      fill: "#fff",
      align: "center"
    });
    text.anchor.setTo(0.5, 0.5);
    text.addColor("#000000", 0); 

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
  
  joinGame() {
    if(this.name.value.length>0) {
        this.state.start('Game', true, false, {name: this.name.value});
    }
}

  update() {
    if(this.input.keyboard.isDown(Phaser.KeyCode.ENTER)) { 
      if(this.name.value.length>0) {
        this.state.start('Game', true, false, {name: this.name.value});
      }
    }
    
    // move clouds
    if(this.cloud1.x > -200) {
      this.cloud1.x -= 0.5;
    }
    else {
      this.cloud1.x = 1200;
    }
    
    if(this.cloud2.x > -200) {
      this.cloud2.x -= 1;
    }
    else {
      this.cloud2.x = 1200;
    }
    
    if(this.cloud3.x > -200) {
      this.cloud3.x -= 0.5;
    }
    else {
      this.cloud3.x = 1200;
    }
    
    if(this.cloud4.x > -200) {
      this.cloud4.x -= 1;
    }
    else {
      this.cloud4.x = 1200;
    }
    
    if(this.cloud5.x > -200) {
      this.cloud5.x -= 1;
    }
    else {
      this.cloud5.x = 1200;
    }
    
    if(this.cloud6.x > -200) {
      this.cloud6.x -= 1;
    }
    else {
      this.cloud6.x = 1200;
    }
    
    if(this.cloud7.x > -200) {
      this.cloud7.x -= 0.5;
    }
    else {
      this.cloud7.x = 1200;
    }
  
  }

  render() {
  }
}

export default Menu