import MainMenuState from './states/main-menu-state';
import GameState from './states/game-state';
import globalState from './util/global-state';
import queryString from 'query-string';

const queryOptions = queryString.parse(window.location.search);

let renderer = Phaser.AUTO;
if (queryOptions.renderer === 'canvas') {
    renderer = Phaser.CANVAS;
} else if (queryOptions.renderer === 'webgl') {
    renderer = Phaser.WEBGL;
}

let game = new Phaser.Game(
    1280,
    704,
    renderer,
    'phaser',
    null
);

if (queryOptions.players) {
    globalState.set('players', parseInt(queryOptions.players, 10));
    globalState.state.round = 1;
    game.state.add('game', new GameState(), true);
} else {
    game.state.add('game', new MainMenuState(), true);
}
