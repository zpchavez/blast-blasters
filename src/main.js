import GameState from './states/game-state';

var game = new Phaser.Game(
    1280,
    720,
    Phaser.AUTO,
    'phaser',
    null
);

game.state.add('game', new GameState, true);
