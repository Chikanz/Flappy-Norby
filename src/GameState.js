//Create an immutable game state that we can revert back to
const defaultState = {
    gameOver: false,
    moving: false, //Has the player tapped to start the game yet?
    score: 0,
}
Object.freeze(defaultState);

export default class GameState {
    constructor() {
        this.Reset();
    }

    Reset() {
        this.current = { ...defaultState }; //set state to a copy of the starting state using es6 spread syntax
    }
}