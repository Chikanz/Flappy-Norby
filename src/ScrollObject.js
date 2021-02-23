//Simple class for background texture scrolling objects like the background + ground
//but in future could be used to add grass, clouds etc very easily

export default class ScrollObject extends Phaser.GameObjects.TileSprite {

    //Preload assets statically since assets don't belong to any single object instance
    static preload(scene) {
        scene.load.image('bg', 'assets/sprites/background-night.png');
        scene.load.image('ground', 'assets/sprites/base.png');
    }

    constructor(scene, x, y, width, height, texture, speed) {
        super(scene, x, y, width, height, texture);
        this.speed = speed;
        scene.add.existing(this);
    }

    //Update is controlled manually via the scene
    update() {
        this.tilePositionX -= this.speed;
    }

    reset() {
        this.tilePositionX = 0;
    }
}