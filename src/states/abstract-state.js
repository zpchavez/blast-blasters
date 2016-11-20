import globalState from '../util/global-state';

class AbstractState extends Phaser.State
{
    create()
    {
        this.game.input.onDown.add(this.toggleFullscreen, this);
    }

    toggleFullscreen()
    {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen(false);
        }
    }

    loadNextRound()
    {
        const GameState = require('./game-state').default;
        const TextState = require('./text-state').default;

        globalState.state.round += 1;
        this.game.state.add(
            'text',
            new TextState(
                `Round ${globalState.state.round}`,
                'game',
                new GameState()
            ),
            true
        );
    }

    shutdown()
    {
        if (this.controls) {
            this.controls.reset();
        }
    }
}

export default AbstractState;
