import Phaser from 'phaser';
import State from '../GameState';
import Player from '../Player';
import ScrollObject from '../ScrollObject';

let state = new State();

//config
const foregroundScrollSpeed = -1;
const BGscrollSpeed = -0.2;
const pipeHole = 120;

//Objects
let bg;
let ground;
let player;
let pipeGroup;

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('pipe', 'assets/sprites/pipe-green.png');
    Player.preload(this);
    ScrollObject.preload(this);
  }

  create() {
    bg = new ScrollObject(this, 0, 690, 800, 600, 'bg', BGscrollSpeed).setOrigin(0, 1);

    this.add.sprite(300, 600, 'pipe');

    ground = new ScrollObject(this, 0, 650, 800, 100, 'ground', foregroundScrollSpeed).setOrigin(0, 1);
    this.physics.add.existing(ground, true); //enable physics on ground

    player = new Player(this, 100, 100, 'norby', Phaser.Input.Keyboard.KeyCodes.SPACE);
    player.collideAgainst(ground);
    player.registerGameOverCallback(GameOver);
  }

  update() {
    //Move BG 
    //(ideally if there were heaps of these they'd be in a list that gets iterated for .update() but
    // I didn't bother since there's only two)
    if (state.current.moving) {
      bg.update();
      ground.update();
    }

    //if (this.space.isDown) {
    //  player.setVelocityY(-playerFlapForce);
    //}
  }
}
function reset() {
  bg.tilePositionX = 0;
  ground.tilePositionX = 0;
  state.reset();
}

function GameOver() {
  state.current.moving = false;
}
