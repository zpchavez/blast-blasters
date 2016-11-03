class Player extends Phaser.Sprite
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);
    }
}

Player.create = (game, x, y) => {
    return new Player(game, x, y, 'player');
};

Player.loadAssets = (state) => {
    state.load.image('player', 'assets/img/player.png');
};

export default Player;
