import MainMenuState from './states/main-menu-state';

var game = new Phaser.Game(
    1280,
    704,
    Phaser.AUTO,
    'phaser',
    null
);

game.state.add('game', new MainMenuState(), true);
