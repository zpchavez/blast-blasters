import AbstractState from './abstract-state';
import ModificationState from './modification-state';
import MainMenuState from './main-menu-state';
import globalState from '../util/global-state';
import colors from '../data/colors';
import leftpad from '../util/leftpad';
import score from '../util/score';
import DelayTimer from '../util/delay';

class ScoreboardState extends AbstractState
{
    constructor(playerKills)
    {
        super();
        this.playerKills = playerKills;
    }

    create()
    {
        super.create();

        this.delayTimer = new DelayTimer(this.game);

        const winningPlayers = score.getWinningPlayers();

        if (winningPlayers.length === 1) {
            this.renderWinner(winningPlayers[0]);
            this.delayTimer.setTimeout(this.returnToMainMenu.bind(this), 3000);
        } else {
            this.renderPlayerKills();
            this.renderScore();
            if (winningPlayers.length > 1) {
                // It's a tie. The non-winning players are eliminated.
                globalState.set('eliminatedPlayers', score.getNonWinningPlayers());
            }
            this.delayTimer.setTimeout(this.loadModScreen.bind(this), 3000);
        }
    }

    renderWinner(player)
    {
        const winnerColor = colors[globalState.get('colors')[player]];
        const winnerText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 - 100,
            winnerColor.name.toUpperCase() + ' WINS!',
            {
                font: '42px Arial',
                fill: '#ffffff',
            }
        )
        winnerText.anchor.set(0.5);
    }

    renderPlayerKills()
    {
        let scoreText = this.game.add.text(
            this.game.width / 2,
            50,
            'Round Score',
            {
                font: '40px Arial',
                fill: '#ffffff',
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        );
        scoreText.anchor.set(0.5);

        this.playerKills.forEach((kills, killer) => {
            const color = colors[globalState.get('colors')[killer]];
            this.game.add.text(
                this.game.width / 2 - 200,
                100 + ((killer + 1) * 50),
                color.name.charAt(0).toUpperCase() + color.name.substr(1),
                {
                    font: '32px Arial',
                    fill: '#' + leftpad(color.hex.toString(16), 6, 0),
                    stroke: '#ffffff',
                    strokeThickness: 2,
                }
            );
            kills.forEach((killed, killIndex) => {
                let playerSprite = this.game.make.sprite(
                    this.game.width / 2 - 80 + (50 * killIndex),
                    100 + ((killer + 1) * 50),
                    'player'
                );
                playerSprite.tint = colors[globalState.get('colors')[killed]].hex;
                this.game.world.addChild(playerSprite);
            });
        });
    }

    renderScore()
    {
        const totalText = this.game.add.text(
            this.game.width / 2,
            380,
            'Total Score',
            {
                font: '40px Arial',
                fill: '#ffffff',
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        );
        totalText.anchor.set(0.5);
        globalState.get('score').forEach((score, index) => {
            const color = colors[globalState.get('colors')[index]];
            this.game.add.text(
                this.game.width / 2 - 200,
                this.game.height - 250 + (index * 50),
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
                this.game.height - 250 + (index * 50),
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

    loadModScreen()
    {
        this.game.state.add('game', new ModificationState(), true);
    }

    returnToMainMenu()
    {
        globalState.reset();
        this.game.state.add('main-menu', new MainMenuState(), true);
    }
}

export default ScoreboardState;
