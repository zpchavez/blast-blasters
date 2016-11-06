import GameState from './game-state';
import globalState from '../util/global-state';
import colors from '../data/colors';
import leftpad from '../util/leftpad';

class ScoreboardState extends Phaser.State
{
    constructor(roundScore)
    {
        super();
        this.roundScore = roundScore;
    }

    create()
    {
        this.renderScore();
        setTimeout(this.loadNextRound.bind(this), 3000);
    }

    renderScore()
    {
        globalState.get('score').forEach((score, index) => {
            const color = colors[globalState.get('colors')[index]];
            let skulls = '';
            for (var i = 0; i < score; i += 1) {
                skulls += '💀';
            }
            this.game.add.text(
                this.game.width / 2 - 200,
                this.game.height / 3 + (index * 50),
                color.name.charAt(0).toUpperCase() + color.name.substr(1),
                {
                    font: '32px Arial',
                    fill: '#' + leftpad(color.hex.toString(16), 6, 0),
                    stroke: '#ffffff',
                    strokeThickness: 2,
                }
            );
            this.game.add.text(
                this.game.width / 2 - 80,
                this.game.height / 3 + (index * 50),
                score,
                {
                    font: '32px Arial',
                    fill: '#' + leftpad(color.hex.toString(16), 6, 0),
                    stroke: '#ffffff',
                    strokeThickness: 2,
                }
            );
        });
    }

    loadNextRound()
    {
        this.game.state.add('game', new GameState(), true);
    }
}

export default ScoreboardState;
