//Class for a single half of a 'pipe'

const playerXpos = 100;

export default class Pipe extends Phaser.Physics.Arcade.Sprite {

    static preload(scene) {
        scene.load.image('pipe_bottom', 'assets/sprites/pipe_bottom.png');
        scene.load.image('pipe_top', 'assets/sprites/pipe_top.png');
    }

    constructor(scene, x, y, texture, speed) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //disable when offscreen by sprite width + a little padding 
        //(this will need to be changed if this object is ever scaled)
        this.disableThreshold = this.width + 20;

        this.body.allowGravity = false;
        this.setPushable(false); //make it so pipes can't be moved by other physics objects

        this.speed = speed;
    }

    //update is managed manually from the pipe manager
    update() {
        if (!this.active) return; //only update when on screen

        this.x += this.speed;

        //disable when off screen
        if (this.x <= -this.disableThreshold && this.active) {
            this.disableBody(true, true);
        }
    }
}