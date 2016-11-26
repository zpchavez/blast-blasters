import AbstractState from './abstract-state';
import ModificationState from './modification-state';
import MainMenuState from './main-menu-state';
import TextState from './text-state';
import globalState from '../util/global-state';
import colors from '../data/colors';
import leftpad from '../util/leftpad';
import score from '../util/score';
import DelayTimer from '../util/delay';
import queryString from 'query-string';

const queryOptions = queryString.parse(window.location.search);

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

        this.renderPlayerKills();
        this.renderScore();
        if (winningPlayers.length > 1) {
            // It's a tie. The non-winning players are eliminated.
            globalState.set('eliminatedPlayers', score.getNonWinningPlayers());
        }

        if (winningPlayers.length === 1) {
            this.delayTimer.setTimeout(this.showWinnerAndReturnToMainMenu.bind(this, winningPlayers[0]), 3000);
        } else {
            if (typeof queryOptions.nomods !== 'undefined') {
                this.delayTimer.setTimeout(this.loadNextRound.bind(this), 3000);
            } else {
                this.delayTimer.setTimeout(this.loadModScreen.bind(this), 3000);
            }
        }
    }

    showWinnerAndReturnToMainMenu(player)
    {
        const winnerColor = colors[globalState.get('colors')[player]];
        const text = winnerColor.name.toUpperCase() + ' WINS!'

        globalState.reset();
        this.game.state.add(
            'winner',
            new TextState(
                text,
                'main-menu',
                new MainMenuState(),
                2000
            ),
            true
        );
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
}

export default ScoreboardState;
