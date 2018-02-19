import Menu from './states/Menu'
import Game from './states/Game'

class App extends Phaser.Game {
  constructor() {
    super(1200, 720, Phaser.AUTO);

    this.state.add('Menu', Menu);    
    this.state.add('Game', Game);
    this.state.start('Game');
  }
}

new App();
