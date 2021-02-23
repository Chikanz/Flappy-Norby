//Class for containing all player functionality

const gravity = 600;
const flapForce = 300;
const jumpTimeOut = 100;

export default class Player extends Phaser.Physics.Arcade.Sprite {

    //Preload assets statically since assets don't belong to any single object instance
    static preload(scene) {
        scene.load.image('norby', 'assets/sprites/norby.png');
        scene.load.image('norby_ded', 'assets/sprites/deadnorby.png');
    }

    constructor(scene, x, y, texture, jumpKey) {
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
        this.body.setGravityY(gravity);
        this.flapForce = flapForce;
        this.jumpKey = scene.input.keyboard.addKey(jumpKey);
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
        this.setTexture('norby_ded');
        this.startGameOver();
        this.setVelocityX(this.flapForce / 2); //roll along the ground a bit after death
    }

    //callback to let scene know when we're dead
    registerGameOverCallback(callback) {
        this.startGameOver = callback;
    }

    update() {

        //Jump mechanics
        if (this.jumpKey.isDown && this.canJump && this.alive) {
            this.setVelocityY(-this.flapForce);
            this.angle = -20
            this.canJump = false;
        }

        //Reset jump only when jump key is up
        if (this.jumpKey.isUp && !this.canJump && !this.startedJumpRestore) {
            this.scene.time.delayedCall(jumpTimeOut, () => {
                this.canJump = true;
                this.startedJumpRestore = false;
            });
            this.startedJumpRestore = true;
        }

        //this used to be in place to mimmic flappy bird behaviour, but looks way funnier without it 
        //if (this.angle < 90) 
        if (this.alive) this.angle += 2;
    }
}