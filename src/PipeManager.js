//Manages creating and pooling pipes
//Pooling code is dead simple - it won't check if a pipe is being used so make sure make the pool
//size larger than the max amount of pipes onscreen at a time

import Pipe from "./Pipe";

const spawnInterval = 2500; //time distance between spawning pipes in ms
const pipeGap = 150; //gap between top and bottom pipe in pixels //125

const playerXpos = 100; //todo pass through constructor

let pipeWidth;
let screenHeight;
let spawnPoint;

export default class PipeManager {

    constructor(scene, poolSize, pipeSpeed) {
        this.pipes = [];
        this.poolSize = poolSize;
        this.poolIndex = 0;

        //Just create a bunch of objects for now, they'll be positioned and textured in Create()
        for (var i = 0; i < poolSize; i++) {
            var p = new Pipe(scene, -999, -999, 'null', 0);
            p.active = false;
            this.pipes.push(p);

            pipeWidth = p.width; //get rough pipe width for spawning
        }

        spawnPoint = scene.cameras.main.width + pipeWidth + 20;
        screenHeight = scene.cameras.main.height;

        this.lastDT = 0;
        this.scene = scene;

        //Score zones
        this.scoreZones = scene.physics.add.group({
            key: 'null',
            repeat: poolSize / 2,
            visible: false,
            allowGravity: false,
            x: -99, y: -99,
        });

        //Set to size of the gap
        this.scoreZones.children.iterate((child) => {
            child.body.setSize(5, pipeGap);
        })

        this.pipeSpeed = pipeSpeed;
    }

    Start() {
        this.CreatePipes('pipe_top', 'pipe_bottom', this.pipeSpeed); //pre spawn a pipe since the next one starts after the timer 
        this.timer = this.scene.time.addEvent({
            delay: spawnInterval,
            startAt: 0,
            callback: () => {
                this.CreatePipes('pipe_top', 'pipe_bottom', this.pipeSpeed);
            },
            loop: true
        });
    }

    Stop() {
        this.timer.remove();
    }

    //Move all pipes + score zones offscreen
    Reset() {
        for (var i = 0; i < this.poolSize; i++) {
            this.pipes[i].y = -9999;
        }

        this.scoreZones.children.iterate((child) => {
            child.y = -999;
        })
    }

    CreatePipes(topPipeTexture, bottomPipeTexture, speed) {
        let randomY = Phaser.Math.Between(100, screenHeight - 200);
        randomY = roundToNearest(randomY, 64) + 64 / 2; //round so that we don't get half of a house (only kinda works, not sure why...)
        this.CreatePipe(topPipeTexture, speed, randomY, false);
        this.CreatePipe(bottomPipeTexture, speed, randomY, true);
    }

    CreatePipe(texture, speed, ypos, isBottom) {
        //Get pipe from pool
        var newPipe = this.pipes[this.poolIndex];
        newPipe.active = true;
        newPipe.body.setEnable(true);
        newPipe.visible = true;

        //Position pipe
        //Set anchor based on if we're spawing a top or bottom pipe to easily get the distance
        //between, then offset by half of the pipegap. The other half is covered by the other pipe
        newPipe.x = spawnPoint;
        newPipe.setOrigin(0.5, isBottom ? 0 : 1);
        newPipe.y = ypos + (isBottom ? pipeGap / 2 : -pipeGap / 2);

        //transfer settings
        newPipe.speed = speed;
        newPipe.setTexture(texture);
        newPipe.body.setSize(newPipe.width, newPipe.height, true); //resize the collider 

        //add score zone (invisible collider)
        if (isBottom) { //only do for one pipe
            const zone = this.scoreZones.children.entries[this.poolIndex % (this.poolSize / 2)];

            zone.x = spawnPoint;
            zone.y = ypos;
            zone.body.setEnable(true);
            zone.active = true;
        }

        //update index + wrap
        this.poolIndex++;
        this.poolIndex = this.poolIndex % this.poolSize
    }

    //Will fire call back when player scores
    OnScore(cb) {
        this.scoreCallBack = cb;
    }

    update() {
        //update pipes
        for (var i = 0; i < this.poolSize; i++) {
            this.pipes[i].update();
        }

        //move score zones (not really ideal)
        this.scoreZones.children.iterate((child) => {
            if (child.active) child.body.x += this.pipeSpeed;
        })
    }
}

function roundToNearest(value, interval) {
    return Math.round(value / interval) * interval;
}