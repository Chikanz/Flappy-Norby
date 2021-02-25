//There is probably a much better way to do this but I couldn't find a way to use custom sprites
//in a sprite font nicely so I just did it my self
//Basically the class just uses a sprite atlas packed with TexturePacker and indexes into it 
//to draw digits and then positions them

const padding = 5;

export default class ScoreRenderer {

    constructor(scene, maxPlaces, x, y) {
        this.numbers = []; //numbers pool
        this.alignment = 'center'; //default to center alignment, others could easily be added in future

        for (var i = 0; i < maxPlaces; i++) {
            let number = scene.add.sprite(-100, -100, 'score_font');
            this.numbers.push(number);

            //since phaser defaults to a centered origin numbers with different widths will have 
            //inconsistent spacing without setting their X origin to 0
            number.setOrigin(0, 0.5);
        }
    }

    static preload(scene) {
        scene.load.multiatlas('score_font', 'assets/sprites/font.json', 'assets/sprites');
    }

    //Update score
    SetScore(score) {
        this.DrawScore(score, this.x, this.y);
    }

    //Draw Score in a new location
    DrawScore(score, x, y) {
        this.Clear();

        //Make sure we're actually passing in an integer
        if (typeof score != 'number') return console.error('Score is not a number');
        if (score % 1 != 0) return console.error('Score renderer does not support decimals');

        //Draw the score
        let scoreString = score.toString();
        let places = scoreString.length;

        if (places > this.numbers.length) console.error('Score is larger than amount of digits available');

        let drawPoint = 0; //the point at which the next character will draw in local space
        for (var i = 0; i < places; i++) {
            let number = this.numbers[i];
            number.y = y;
            number.setFrame(scoreString[i] + '.png');

            number.x = x + drawPoint;
            drawPoint += number.width + padding;
        }

        let shiftAmount = 0;

        //center by shifting all digits back half of total width
        if (this.alignment === 'center') shiftAmount = drawPoint / 2;

        //left alignment is done by default
        //right alignment could by done by changing shift amount to the full width (ie just 
        //shifting by drawPoint)

        for (var i = 0; i < places; i++) {
            let number = this.numbers[i];
            number.x -= shiftAmount;
        }

        this.x = x; this.y = y;
    }

    //Just move numbers off screen
    Clear() {
        for (var i = 0; i < this.numbers.length; i++) {
            this.numbers[i].y = -100;
        }
    }
}

