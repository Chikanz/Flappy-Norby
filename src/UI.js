//handles sprites for title, tutorial and gameover so the main file can stay clean

let title;
let tutorial;
let gameOver;
let gameOverTween;
let bestText;

export default class UI {

    static preload(scene) {
        scene.load.image('title', 'assets/sprites/titleCard.png');
        scene.load.image('tutorial', 'assets/sprites/tutorial.png');
        scene.load.image('game_over', 'assets/sprites/gameover.png');
    }

    constructor(scene) {
        //Title
        title = scene.add.image(400, scene.cameras.main.height / 4, 'title');
        title.setScale(2);
        scene.tweens.add({
            targets: title,
            y: scene.cameras.main.height / 4 + 20,
            ...subtlebob
        });

        //Tutorial + game over (off screen)
        tutorial = scene.add.image(400, scene.cameras.main.height - 250, 'tutorial');
        gameOver = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height + 100, 'game_over');

        //sorry this looks like shit, I ran out of time haha
        bestText = scene.add.text(20, scene.cameras.main.height - 70, 'Best: 0', { fontFamily: 'Arial' });
        this.SetBestScore();

        this.scene = scene;
    }

    //fade out title card and tutorial when game starts
    RemoveTitleSprites() {
        this.scene.tweens.add({ targets: [title, bestText, tutorial], ...fadeOut });
    }

    //tween in the game over sprite
    ShowGameOver() {
        gameOverTween = this.scene.tweens.add({ targets: gameOver, ...fadeInMove });
    }

    Reset() {
        //turn on title
        this.scene.tweens.add({ targets: [title, tutorial, bestText], ...fadeIn });

        //offscreen game over 
        gameOverTween.remove();
        gameOver.y = this.scene.cameras.main.height + 100

        this.SetBestScore();
    }

    SetBestScore() {
        const best = localStorage.getItem('best');
        if (best !== null) {
            bestText.setText('Best: ' + best);
        }
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

const fadeIn = {
    alpha: { from: 0, to: 1 },
    duration: 1000,
    ease: 'Power2'
}