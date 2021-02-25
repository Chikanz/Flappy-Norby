//Class for containing all player functionality

const gravity = 600;
const flapForce = 300;
const jumpTimeOut = 100;

export default class Player extends Phaser.Physics.Arcade.Sprite {

    //Preload assets statically since assets don't belong to any single object instance
    static preload(scene) {

        //Sprites
        scene.load.image('norby', 'assets/sprites/norby.png');
        scene.load.image('norby_dead', 'assets/sprites/deadnorby.png');

        //Audio
        scene.load.audio('flap', 'assets/audio/wing.wav');
        scene.load.audio('hit', 'assets/audio/hit.wav');
        scene.load.audio('point', 'assets/audio/point.wav');
    }

    constructor(scene, x, y, texture, deadTexture, jumpKey) {
        //Create the object by filling sprite constructor + register update
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.events.on('update', this.update, this);
        this.scene = scene; //hang onto scene ref for later

        //Roof collision detection
        this.setCollideWorldBounds(true);
        this.body.onWorldBounds = true; //actually emit event when we hit the roof
        scene.physics.world.on('worldbounds', () => this.die());
        this.setBounce(0.4);

        //general setup
        this.canJump = true;
        this.alive = true;
        this.startedJumpRestore = false;

        //pass through settings
        this.flapForce = flapForce;
        this.jumpKey = scene.input.keyboard.addKey(jumpKey);

        this.textureName = texture;
        this.deadTexture = deadTexture;
        this.startPosition = { x, y };
    }

    //helper function to register collision with other stuff in the scene
    collideAgainst(group) {
        this.scene.physics.add.collider(this, group, this.die, null, this);
    }

    //called on collision, starts game over sequence
    die() {
        if (!this.alive) return;

        this.alive = false;
        this.body.setDrag(80);
        this.setTexture(this.deadTexture);
        this.startGameOver();
        this.setVelocityX(this.flapForce / 2); //roll along the ground a bit after death
        this.scene.sound.play('hit');
    }

    update() {
        if (!this.alive) return; //no need to update when dead

        //Jump mechanics
        if (this.jumpKey.isDown && this.canJump) {
            this.setVelocityY(-this.flapForce);
            this.angle = -20
            this.canJump = false;
            this.scene.sound.play('flap');

            //Break out of start state
            if (this.waiting) {
                this.waiting = false;
                this.tween.remove();
                this.body.allowGravity = true;
                this.body.setGravityY(gravity);
                this.startGame();
            }
        }

        //Reset jump only when jump key is up
        if (this.jumpKey.isUp && !this.canJump && !this.startedJumpRestore) {
            this.scene.time.delayedCall(jumpTimeOut, () => {
                this.canJump = true;
                this.startedJumpRestore = false;
            });
            this.startedJumpRestore = true;
        }

        //this line below used to be in place to mimmic flappy bird behaviour, but looks way funnier without it lol
        //if (this.angle < 90) 
        if (!this.waiting) this.angle += 2;
    }

    //For when the game is waiting to be started
    StartScreenBob() {
        this.body.allowGravity = false;
        this.tween = this.scene.tweens.add({
            targets: this,
            y: this.y + 20,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

        this.waiting = true;
    }

    Reset() {
        this.x = this.startPosition.x;
        this.y = this.startPosition.y;
        this.setVelocity(0, 0);
        this.body.setGravityY(0);

        this.angle = 0;
        this.canJump = true;
        this.startedJumpRestore = false;

        this.alive = true;

        this.setTexture(this.textureName)
    }


    //callback to let scene know when we're dead
    OnGameOver(callback) {
        this.startGameOver = callback;
    }

    //CallBack to let scene know when we've started the game
    OnGameStart(callback) {
        this.startGame = callback;
    }
}