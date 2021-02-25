//Simple class for handling global state

//Create an immutable game state that we can revert back to
const defaultState = {
    gameOver: false,
    moving: false, //is the ground moving?
    score: 0,
}
Object.freeze(defaultState);

export default class GameState {
    constructor() {
        this.Reset();
    }

    //set state to a copy of the starting state using es6 spread syntax
    Reset() {
        this.current = { ...defaultState };
    }
}