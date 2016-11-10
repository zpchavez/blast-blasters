import AbstractState from './abstract-state';
import GameState from './game-state';
import MainMenuState from './main-menu-state';
import globalState from '../util/global-state';
import colors from '../data/colors';
import leftpad from '../util/leftpad';

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

        const winningPlayers = this.getWinningPlayers();

        if (winningPlayers.length === 1) {
            this.renderWinner(winningPlayers[0]);
            setTimeout(this.returnToMainMenu.bind(this), 3000);
        } else {
            this.renderPlayerKills();
            this.renderScore();
            if (winningPlayers.length > 1) {
                // It's a tie. The non-winning players are eliminated.
                globalState.set('eliminatedPlayers', this.getNonWinningPlayers());
            }
            setTimeout(this.loadNextRound.bind(this), 3000);
        }
    }

    renderWinner(player)
    {
        const winnerColor = colors[player];
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
        this.game.add.text(
            this.game.width / 2 - 150,
            50,
            'Round Kills',
            {
                font: '40px Arial',
                fill: '#ffffff',
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        );
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
        this.game.add.text(
            this.game.width / 2 - 150,
            380,
            'Total Score',
            {
                font: '40px Arial',
                fill: '#ffffff',
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        );
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

    /**
     * Get array of players who have met the number of points
     * required to win and who have more points than any other
     * players
     */
    getWinningPlayers()
    {
        const scoreToPlayers = {};

        globalState.get('score').forEach((score, player) => {
            if (! scoreToPlayers[score]) {
                scoreToPlayers[score] = [];
            }
            scoreToPlayers[score].push(player);
        });

        const sortedScores = globalState.get('score').sort((a, b) => a < b);
        let winningPlayers = null;
        sortedScores.forEach(score => {
            if (winningPlayers === null && score >= this.getWinningScore()) {
                winningPlayers = scoreToPlayers[score];
            }
        });

        return winningPlayers;
    }

    getWinningScore()
    {
        return globalState.get('players') * 5;
    }

    getNonWinningPlayers()
    {
        const nonWinningPlayers = [];
        const winningPlayers = this.getWinningPlayers();
        globalState.get('score').forEach((score, player) => {
            if (winningPlayers.indexOf(player) === -1) {
                nonWinningPlayers.push(player);
            }
        });

        return nonWinningPlayers;
    }

    loadNextRound()
    {
        this.game.state.add('game', new GameState(), true);
    }

    returnToMainMenu()
    {
        globalState.reset();
        this.game.state.add('main-menu', new MainMenuState(), true);
    }
}

export default ScoreboardState;
