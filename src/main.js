import MainMenuState from './states/main-menu-state';
import ModificationState from './states/modification-state';
import globalState from './util/global-state';

var game = new Phaser.Game(
    1280,
    704,
    Phaser.AUTO,
    'phaser',
    null
);

globalState.setInitialScore(4);
globalState.state.score[0] = 5;
game.state.add('game', new ModificationState, true);
