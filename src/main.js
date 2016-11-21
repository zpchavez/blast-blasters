import MainMenuState from './states/main-menu-state';
import GameState from './states/game-state';
import globalState from './util/global-state';
import queryString from 'query-string';

var game = new Phaser.Game(
    1280,
    704,
    Phaser.AUTO,
    'phaser',
    null
);

const queryOptions = queryString.parse(window.location.search);
if (queryOptions.players) {
    globalState.set('players', parseInt(queryOptions.players, 10));
    globalState.state.round = 1;
    game.state.add('game', new GameState(), true);
} else {
    game.state.add('game', new MainMenuState(), true);
}
