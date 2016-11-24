const sounds = {};

export default {
    addOrGet(game, key) {
        if (! sounds[key]) {
            sounds[key] = game.add.audio(key);
        }
        return sounds[key];
    },
};
