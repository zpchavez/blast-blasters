import AbstractState from './abstract-state';
import MainMenuState from './main-menu-state';
import Controls from '../util/controls';
import Player from '../objects/player';
import colors from '../data/colors';
import globalState from '../util/global-state';

class SelectColorState extends AbstractState
{
    preload()
    {
        Player.loadAssets(this);
    }

    create()
    {
        super.create();

        this.renderText();
        this.renderPlayers();
        this.initInputs();
        this.renderLeftyIndicators();
    }

    renderText()
    {
        this.titleText = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) - 150,
            "Choose Color",
            {
                font: '42px Arial',
                fill: '#ffffff',
            }
        );
        this.titleText.anchor.setTo(0.5);

        this.leftyModeText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 + 300,
            'Press Dash to toggle Lefty Mode',
            {
                font: '20px Arial',
                fill: '#ffffff',
            }
        );
        this.leftyModeText.anchor.setTo(0.5);
    }

    renderPlayers()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        var positions;
        if (globalState.get('players') === 1) {
            positions = [
                [this.game.width / 2, this.game.height / 2]
            ];
        } else if (globalState.get('players') === 2) {
            positions = [
                [(this.game.width / 2) - 50, this.game.height / 2],
                [(this.game.width / 2) + 50, this.game.height / 2],
            ];
        } else if (globalState.get('players') === 3) {
            positions = [
                [this.game.width / 2, this.game.height / 2],
                [(this.game.width / 2) - 100, this.game.height / 2],
                [(this.game.width / 2) + 100, this.game.height / 2],
            ];
        } else if (globalState.get('players') === 4) {
            positions = [
                [(this.game.width / 2) - 150, this.game.height / 2],
                [(this.game.width / 2) - 50, this.game.height / 2],
                [(this.game.width / 2) + 50, this.game.height / 2],
                [(this.game.width / 2) + 150, this.game.height / 2],
            ];
        } else {
            throw new Error('Invalid number of players: ' + globalState.get('players'));
        }

        var playerSprites = [];
        for (var player = 0; player < positions.length; player += 1) {
            playerSprites.push(
                Player.create(
                    player,
                    this.game,
                    positions[player][0],
                    positions[player][1],
                )
            );
            playerSprites[player].tint = colors[player].hex;
            playerSprites[player].body.fixedRotation = false;
            this.game.world.addChild(playerSprites[player]);
        }
        this.playerSprites = playerSprites;
        this.colorCursors = [0, 1, 2, 3];
        this.selectedColors = [null, null, null, null];
    }

    changeColor(player, direction)
    {
        // Player who isn't playing can't change color
        if (! this.playerSprites[player]) {
            return;
        }

        // Can't change color if player already selected a color
        if (this.selectedColors[player] !== null) {
            return;
        }

        var colorIndex;
        if (direction === 'LEFT') {
            colorIndex = (
                this.colorCursors[player] === 0
                ? colors.length - 1
                : this.colorCursors[player] - 1
            );
        } else {
            colorIndex = (
                this.colorCursors[player] === colors.length - 1
                ? 0
                : this.colorCursors[player] + 1
            );
        }

        // If color selected by another player, select the next available color
        if (this.selectedColors.indexOf(colorIndex) !== -1) {
            colorIndex = this.getNextAvailableColorIndex(colorIndex, direction);
        }

        this.playerSprites[player].tint = colors[colorIndex].hex;
        this.colorCursors[player] = colorIndex;
    }

    getNextAvailableColorIndex(index, direction)
    {
        var filteredSelectedColors = this.selectedColors.filter(function (colorIndex) {
            return colorIndex !== null;
        });

        var multiplier = (direction === 'LEFT' ? -1 : 1);

        var nextAvailable;
        var candidate = index;

        do {
            candidate = candidate + (1 * multiplier);
            if (candidate === colors.length) {
                candidate = 0;
            }
            if (candidate < 0) {
                candidate = colors.length - 1;
            }

            if (this.selectedColors.indexOf(candidate) === -1) {
                nextAvailable = candidate;
            }
        } while (typeof nextAvailable === 'undefined');

        return nextAvailable;
    }

    selectColor(player)
    {
        if (this.allSelected()) {
            this.startGame();
            return;
        }

        // Select if not already selected
        if (this.selectedColors.indexOf(this.colorCursors[player]) === -1) {
            this.selectedColors[player] = this.colorCursors[player];
            this.playerSprites[player].cannonSprite.visible = true;
        }

        var selections = this.selectedColors.filter(function(index) {return index !== null});
        if (this.allSelected()) {
            this.showAllSelectedMessage();
        }
    }

    allSelected()
    {
        var selections = this.selectedColors.filter(function(index) {return index !== null});
        return selections.length === globalState.get('players');
    }

    cancelSelectionOrReturnToMainMenu(player)
    {
        if (this.allSelectedMessage) {
            this.allSelectedMessage.destroy();
            this.allSelectedMessage = null;
        }

        if (this.selectedColors[player] === null) {
            this.game.state.add('main-menu', new MainMenuState(), true);
        } else {
            this.selectedColors[player] = null;
            this.playerSprites[player].cannonSprite.visible = false;
            this.playerSprites[player].body.angle = 0;
        }
    }

    update()
    {
        // Indicate which players have chosen a color
        this.selectedColors.forEach((color, player) => {
            if (color !== null) {
                this.playerSprites[player].body.rotateRight(150);
            }
        });
    }

    showAllSelectedMessage()
    {
        this.allSelectedMessage = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) + 250,
            "Press button to start!",
            {
                font: '24px Arial',
                fill: '#ffffff',
            }
        );
        this.allSelectedMessage.anchor.setTo(0.5, 0.5);
    }

    toggleLeftyMode(player)
    {
        globalState.state.lefties[player] = ! globalState.state.lefties[player];
        this.renderLeftyIndicators();
    }

    renderLeftyIndicators()
    {
        if (! this.leftyIndicators) {
            this.leftyIndicators = [null, null, null, null];
        }

        globalState.state.lefties.forEach((lefty, player) => {
            if (lefty && ! this.leftyIndicators[player]) {
                this.leftyIndicators[player] = this.game.add.text(
                    this.playerSprites[player].x,
                    this.playerSprites[player].y + 50,
                    'LH',
                    {
                        font: '24px Arial',
                        fill: '#ffffff',
                    }
                );
                this.leftyIndicators[player].anchor.setTo(0.5);
            } else if (!lefty && this.leftyIndicators[player]) {
                this.leftyIndicators[player].destroy();
                this.leftyIndicators[player] = null;
            }
        });
    }

    startGame()
    {
        this.controls.reset();
        globalState.set('colors', this.selectedColors);
        this.loadNextRound();
    }

    initInputs()
    {
        this.controls = new Controls(this.game);
        for (var player = 0; player < 4; player += 1) {
            this.controls.onDown(player, 'LEFT', this.changeColor.bind(this, player, 'LEFT'));
            this.controls.onDown(player, 'RIGHT', this.changeColor.bind(this, player, 'RIGHT'));
            this.controls.onDown(player, 'SELECT', this.selectColor.bind(this, player));
            this.controls.onDown(player, 'DASH', this.toggleLeftyMode.bind(this, player));
            this.controls.onDown(player, 'CANCEL', this.cancelSelectionOrReturnToMainMenu.bind(this, player));
        }
    }
}

export default SelectColorState;
