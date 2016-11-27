import AbstractState from './abstract-state';
import SelectColorState from './select-color-state';
import globalState from '../util/global-state';
import Controls from '../util/controls';

const PLAYERS_2 = 0;
const PLAYERS_3 = 1;
const PLAYERS_4 = 2;

class MainMenuState extends AbstractState
{
    create()
    {
        super.create();

        globalState.reset();

        this.numPlayersSelection = PLAYERS_2;
        this.playerChoices = [
            { players: 2 },
            { players: 3 },
            { players: 4 },
        ];

        this.controls = new Controls(this.game)

        this.renderTitle();

        this.renderNumPlayersMenu();
        this.renderNumPlayersCursor();

        this.initInputs();
    }

    renderTitle()
    {
        this.titleText = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) - 100,
            "Blast Blasters!",
            {
                font: '42px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.titleText.anchor.setTo(0.5, 0.5);
    }

    renderNumPlayersMenu()
    {
        var options = { fill: '#ffffff' };

        var optionStrings = ['2 Players', '3 Players', '4 Players'];
        this.numberOfPlayersTextObjects = [];
        optionStrings.forEach((text, index) => {
            this.numberOfPlayersTextObjects.push(
                this.game.add.text(
                    this.game.width / 2 - 50,
                    300 + (index * 30),
                    text,
                    options
                )
            );
        });
    }

    renderNumPlayersCursor()
    {
        var selectedText = this.numberOfPlayersTextObjects[this.numPlayersSelection];

        if (this.cursor) {
            this.cursor.destroy();
        }

        this.cursor = this.game.add.text(
            selectedText.x - 40,
            selectedText.y,
            '▶',
            {
                fill: '#ffffff',
                font: '24px Arial'
            }
        );
    }

    moveCursorUp()
    {
        if (this.numPlayersSelection === 0) {
            this.numPlayersSelection = PLAYERS_4;
        } else {
            this.numPlayersSelection -= 1;
        }
        this.renderNumPlayersCursor();
    }

    moveCursorDown()
    {
        if (this.numPlayersSelection === this.playerChoices.length - 1) {
            this.numPlayersSelection = PLAYERS_2;
        } else {
            this.numPlayersSelection += 1;
        }
        this.renderNumPlayersCursor();
    }

    selectOption()
    {
        globalState.set('players', this.playerChoices[this.numPlayersSelection].players);
        this.game.state.add('select-color', new SelectColorState(), true);
    }

    initInputs()
    {
        this.controls = new Controls(this.game);
        for (let i = 0; i < 4; i+= 1) {
            this.controls.onDown(i, 'UP', this.moveCursorUp.bind(this));
            this.controls.onDown(i, 'DOWN', this.moveCursorDown.bind(this));
            this.controls.onDown(i, 'SELECT', this.selectOption.bind(this));
        }
    }
}

export default MainMenuState;
