import AbstractState from './abstract-state';
import GameState from './game-state';
import Controls from '../util/controls';
import globalState from '../util/global-state';
import score from '../util/score';
import rng from '../util/rng';
import ucfirst from '../util/ucfirst';
import colors from '../data/colors';
import mods from '../data/mods';
import Player from '../objects/player';

const MOD_CHOICES_COUNT = 3;
const MOD_LEAD_THRESHOLD = 3;

const CURSOR_SECTION_MODS = 'CURSOR_SECTION_MODS';
const CURSOR_SECTION_PLAYERS = 'CURSOR_SECTION_PLAYERS';

class ModificationState extends AbstractState
{
    preload()
    {
        Player.loadAssets(this);
    }

    create()
    {
        if (score.getLead() > MOD_LEAD_THRESHOLD) {
            this.renderModSelection();
        } else {
            this.game.state.add('game', new GameState(), true);
        }

        this.initInputs();
    }

    update()
    {

    }

    initInputs()
    {
        const leadingPlayer = score.getLeadingPlayer();

        this.controls = new Controls(this.game);

        this.controls.onDown(leadingPlayer, 'UP', this.moveCursorUp.bind(this));
        this.controls.onDown(leadingPlayer, 'DOWN', this.moveCursorDown.bind(this));
        this.controls.onDown(leadingPlayer, 'LEFT', this.moveCursorLeft.bind(this));
        this.controls.onDown(leadingPlayer, 'RIGHT', this.moveCursorRight.bind(this));
        this.controls.onDown(leadingPlayer, 'SELECT', this.selectOption.bind(this));
        this.controls.onDown(leadingPlayer, 'CANCEL', this.cancelSelection.bind(this));
    }

    getModChoices()
    {
        const allMods = Object.keys(mods);
        const modChoices = [];

        for (let i = 0; i < MOD_CHOICES_COUNT; i += 1) {
            if (allMods.length < 1) {
                break;
            }
            let modIndex = rng.between(0, allMods.length - 1);
            modChoices.push(allMods.splice(modIndex, 1)[0]);
        }

        return modChoices;
    }

    moveCursorUp()
    {
        if (this.cursorSection === CURSOR_SECTION_MODS) {
            if (this.selectedMod === 0) {
                this.selectedMod = this.modChoiceTextObjects.length - 1;
            } else {
                this.selectedMod -= 1;
            }
            this.renderModDescription();
            this.renderCursor();
        }
    }

    moveCursorDown()
    {
        if (this.cursorSection === CURSOR_SECTION_MODS) {
            if (this.selectedMod === this.modChoiceTextObjects.length - 1) {
                this.selectedMod = 0
            } else {
                this.selectedMod += 1;
            }
            this.renderModDescription();
            this.renderCursor();
        }
    }

    moveCursorLeft()
    {
        const nonLeadingPlayers = score.getNonLeadingPlayers();
        if (this.cursorSection === CURSOR_SECTION_PLAYERS) {
            if (this.selectedPlayer === 0) {
                this.selectedPlayer = nonLeadingPlayers.length - 1;
            } else {
                this.selectedPlayer -= 1;
            }
            this.renderCursor();
        }
    }

    moveCursorRight()
    {
        const nonLeadingPlayers = score.getNonLeadingPlayers();
        if (this.cursorSection === CURSOR_SECTION_PLAYERS) {
            if (this.selectedPlayer === nonLeadingPlayers.length - 1) {
                this.selectedPlayer = 0;
            } else {
                this.selectedPlayer += 1;
            }
            this.renderCursor();
        }
    }

    selectOption()
    {
        if (this.cursorSection === CURSOR_SECTION_MODS) {
            this.cursorSection = CURSOR_SECTION_PLAYERS;
            this.modChoiceTextObjects[this.selectedMod].fill = '#00FFFF';
            this.renderCursor();
        } else {

        }
    }

    cancelSelection()
    {
        if (this.cursorSection === CURSOR_SECTION_PLAYERS) {
            this.cursorSection = CURSOR_SECTION_MODS;
            this.modChoiceTextObjects[this.selectedMod].fill = '#FFFFFF';
            this.renderCursor();
        }
    }

    renderModSelection()
    {
        this.renderHeading();
        this.renderModChoices();
        this.renderModDescription();
        this.renderPlayers();
        this.renderCursor();
    }

    renderHeading()
    {
        const leadingPlayer = score.getLeadingPlayer();
        const leadingColor = globalState.getPlayerColorInfo(leadingPlayer);
        const leadingPlayerName = ucfirst(leadingColor.name);

        this.headingText = this.game.add.text(
            this.game.width / 2,
            20,
            `You're too good, ${leadingPlayerName}. Augment your foes!`,
            {
                font: '32px Arial',
                fill: '#ffffff',
            }
        )
        this.headingText.anchor.set(0.5);
    }

    renderModChoices()
    {
        this.modChoices = this.getModChoices();
        const options = { fill: '#ffffff' };

        this.selectedMod = 0;

        this.modChoiceTextObjects = [];
        this.modChoices.forEach((key, index) => {
            this.modChoiceTextObjects.push(
                this.game.add.text(
                    (this.game.width / 2) - 100,
                    80 + (index * 30),
                    mods[key].name,
                    options
                )
            );
        });
    }

    renderPlayers()
    {
        const nonLeadingPlayers = score.getNonLeadingPlayers();

        this.selectedPlayer = 0;

        this.playerSprites = [];
        nonLeadingPlayers.forEach((player, index) => {
            let playerSprite = this.game.make.sprite(
                this.game.width / 2 - 270 + (250 * index),
                300,
                'player'
            );
            playerSprite.tint = globalState.getPlayerColorInfo(player).hex
            this.playerSprites.push(playerSprite);
            this.game.world.addChild(playerSprite);
        });
    }

    renderModDescription()
    {
        const mod = mods[this.modChoices[this.selectedMod]];

        if (this.modDescriptionText) {
            this.modDescriptionText.destroy();
        }

        this.modDescriptionText = this.game.add.text(
            this.game.width / 2,
            250,
            mod.description,
            { fill: '#ffffff' }
        );
        this.modDescriptionText.anchor.set(0.5);
    }

    renderCursor()
    {
        if (! this.cursorSection) {
            this.cursorSection = CURSOR_SECTION_MODS;
        }

        if (this.cursor) {
            this.cursor.destroy();
        }

        if (this.cursorSection === CURSOR_SECTION_MODS) {
            const selectedText = this.modChoiceTextObjects[this.selectedMod];
            this.cursor = this.game.add.text(
                selectedText.x - 40,
                selectedText.y,
                '▶',
                {
                    fill: '#ffffff',
                    font: '24px Arial'
                }
            );
        } else {
            const selectedPlayer = this.playerSprites[this.selectedPlayer];
            this.cursor = this.game.add.text(
                selectedPlayer.x + 4,
                selectedPlayer.y - 30,
                '▼',
                {
                    fill: '#ffffff',
                    font: '24px Arial'
                }
            );
        }
    }
}

export default ModificationState;
