import GameState from './states/game-state';

var game = new Phaser.Game(
    1280,
    704,
    Phaser.AUTO,
    'phaser',
    null
);

game.state.add('game', new GameState, true);
