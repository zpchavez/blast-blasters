const initialState = Object.assign(
    {
        colors: [0, 1, 2, 3],
    }
);

export default {
    state: Object.assign({}, initialState),

    reset: function() {
        this.state = Object.assign({}, initialState);
    },

    set: function(key, value) {
        this.state[key] = value;
    },

    setFromObj: function(stateValues) {
        this.state = Object.assign(this.state, stateValues);
    },

    get: function(key) {
        return this.state[key];
    },

    setInitialScore: function(players) {
        if (players) {
            this.set('players', players);
        }

        this.state.score = new Array(this.state.players).fill(0);

        return this;
    }
}
