import Phaser from 'phaser';
import State from '../GameState';
import Player from '../Player';
import ScrollObject from '../ScrollObject';
import Pipe from '../Pipe';
import PipeManager from '../PipeManager';
import ScoreRenderer from '../ScoreRenderer';

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
let title;
let titleTween;
let tutorial;
let gameOver;
let gameOverTween;

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    Pipe.preload(this);
    Player.preload(this);
    ScrollObject.preload(this);
    ScoreRenderer.preload(this);

    //Starting UI
    this.load.image('title', 'assets/sprites/titleCard.png');
    this.load.image('tutorial', 'assets/sprites/tutorial.png');
    this.load.image('game_over', 'assets/sprites/gameover.png');
  }

  create() {
    //background texture scroll
    bg = new ScrollObject(this, 0, 690, 800, 600, 'bg', BGscrollSpeed).setOrigin(0, 1);

    //Setup Player
    player = new Player(this, playerXpos, this.cameras.main.height / 4, 'norby', 'norby_dead', Phaser.Input.Keyboard.KeyCodes.UP);

    player.StartScreenBob();
    player.OnGameStart(() => this.StartGame());
    player.OnGameOver(() => this.EndGame()); //has to be an anon method so that the 'this' keyword refers to the scene

    //Setup Pipes + collisions against player
    pipeMan = new PipeManager(this, 10, foregroundScrollSpeed);
    for (var i = 0; i < pipeMan.pipes.length; i++) {
      player.collideAgainst(pipeMan.pipes[i]);
    }
    this.physics.add.overlap(player, pipeMan.scoreZones, this.AddScore, null, this); //scoring

    //Ground
    ground = new ScrollObject(this, 0, 650, 800, 100, 'ground', foregroundScrollSpeed).setOrigin(0, 1);
    this.physics.add.existing(ground, true); //enable physics on ground
    player.collideAgainst(ground);

    //Score text
    scoreText = new ScoreRenderer(this, 4);

    //Title card + tutorial
    title = this.add.image(400, this.cameras.main.height / 4, 'title');
    title.setScale(2);
    titleTween = this.tweens.add({
      targets: title,
      y: this.cameras.main.height / 4 + 20,
      ...subtlebob
    });

    tutorial = this.add.image(400, this.cameras.main.height - 250, 'tutorial');
    gameOver = this.add.image(this.cameras.main.width / 2, this.cameras.main.height + 100, 'game_over');

    this.input.keyboard.on('keyup', (event) => {
      if (state.current.gameOver) {
        this.Reset();
      }
    })
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

  //Called when player overlaps with score zone
  AddScore(player, zone) {
    if (!player.alive) return; //todo make funcitno
    scoreText.SetScore(++state.current.score);
    zone.x = -99;
    zone.disableBody(true, true);
    this.sound.play('point');
  }

  StartGame() {
    state.current.moving = true;
    pipeMan.Start();

    scoreText.DrawScore(0, this.cameras.main.width / 2, 50);

    this.tweens.add({ targets: title, ...fadeOut });
    this.tweens.add({ targets: tutorial, ...fadeOut });
  }

  //Triggered by player ending the game
  EndGame() {
    state.current.gameOver = true;
    state.current.moving = false;
    pipeMan.Stop();

    gameOverTween = this.tweens.add({ targets: gameOver, ...fadeInMove });

    //Set highscore
    const best = localStorage.getItem('best');
    if (state.current.score > best)
      localStorage.setItem('best', state.current.score);
  }

  //called when any key is pressed after game over
  //there's probably some phaser way of doing this but I bet this is way faster
  Reset() {
    title.alpha = 1;
    tutorial.alpha = 1;

    gameOverTween.remove();
    gameOver.y = this.cameras.main.height + 100
    pipeMan.Reset();
    state.Reset();
    scoreText.SetScore(0);



    player.Reset();
    player.StartScreenBob();

    //reset tiled bg
    bg.tilePositionX = 0;
    ground.tilePositionX = 0;
  }
}

//tweens
const subtlebob = {
  duration: 1500,
  ease: 'Sine.inOut',
  yoyo: true,
  repeat: -1
}

const fadeOut = {
  alpha: 0,
  duration: 300,
  ease: 'Power2'
}

const fadeInMove = {
  y: 300,
  alpha: { from: 0, to: 1 },
  duration: 2000,
  ease: 'Bounce'
}