import colors from '../data/colors';

export default {
    state: {},

    getInitialState() {
        return {
            colors: [0, 1, 2, 3],
            round: 0,
            mods: [],
            // Players that are out of the game because other players are tied for the win
            eliminatedPlayers: [],
        };
    },

    reset() {
        this.state = Object.assign({}, this.getInitialState());
    },

    set(key, value) {
        this.state[key] = value;
        if (key === 'players') {
            this._initializeForNumberOfPlayers(value);
        }
    },

    setFromObj(stateValues) {
        this.state = Object.assign(this.state, stateValues);
    },

    get(key) {
        return this.state[key];
    },

    getPlayerColorInfo(player) {
        return colors[this.state.colors[player]];
    },

    addMod(player, modKey) {
        if (! this.state.mods[player][modKey]) {
            this.state.mods[player][modKey] = {
                modKey,
                level: 1
            };
        } else {
            this.state.mods[player][modKey].level += 1;
        }
    },

    getMod(player, modKey) {
        return this.state.mods[player][modKey] || null;
    },

    _initializeForNumberOfPlayers: function(players) {
        this.state.score = new Array(players).fill(0);
        for (let i = 0; i < players; i += 1) {
            this.state.mods[i] = {};
        }

        return this;
    },
}
