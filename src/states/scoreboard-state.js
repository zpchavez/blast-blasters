import AbstractState from './abstract-state';
import GameState from './game-state';
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

        this.renderPlayerKills();
        this.renderScore();
        setTimeout(this.loadNextRound.bind(this), 3000);
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

    loadNextRound()
    {
        this.game.state.add('game', new GameState(), true);
    }
}

export default ScoreboardState;
