import Phaser from 'phaser';
import State from '../GameState';
import Player from '../Player';
import ScrollObject from '../ScrollObject';
import Pipe from '../Pipe';
import PipeManager from '../PipeManager';

let state = new State();

//config
const foregroundScrollSpeed = -2;
const BGscrollSpeed = 0; //turned this off because it was flickering and it was kinda annoying 
const playerXpos = 100;

//Objects
let bg;
let ground;
let player;
let pipeMan;
let scoreText;

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {

    Pipe.preload(this);
    Player.preload(this);
    ScrollObject.preload(this);
  }

  create() {
    //background texture scroll
    bg = new ScrollObject(this, 0, 690, 800, 600, 'bg', BGscrollSpeed).setOrigin(0, 1);

    //Setup Player
    player = new Player(this, playerXpos, 100, 'norby', Phaser.Input.Keyboard.KeyCodes.UP);
    player.registerGameOverCallback(GameOver);

    //Setup Pipes + collisions against player
    pipeMan = new PipeManager(this, 6, foregroundScrollSpeed);
    for (var i = 0; i < pipeMan.pipes.length; i++) {
      player.collideAgainst(pipeMan.pipes[i]);
    }

    //Ground
    ground = new ScrollObject(this, 0, 650, 800, 100, 'ground', foregroundScrollSpeed).setOrigin(0, 1);
    this.physics.add.existing(ground, true); //enable physics on ground
    player.collideAgainst(ground);

    //Score text
    scoreText = this.add.text(30, 30, 'Score: ' + state.current.score, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });

    this.physics.add.overlap(player, pipeMan.scoreZones, (player, zone) => {
      if (!player.alive) return; //todo make funcitno
      scoreText.setText('Score: ' + ++state.current.score);
      zone.x = -99;
      zone.disableBody(true, true);

    }, null, this);
  }

  update() {
    //Only spawn pipes when the level is moving
    pipeMan.spawnPipes = state.current.moving;

    //Move BG 
    //(ideally if there were heaps of these they'd be in a list that gets iterated for .update())
    if (state.current.moving) {
      bg.update();
      ground.update();
      pipeMan.update();
    }
  }
}
function reset() {
  bg.tilePositionX = 0;
  ground.tilePositionX = 0;
  state.reset();
}

//todo show game over scree
function GameOver() {
  state.current.moving = false;
}
