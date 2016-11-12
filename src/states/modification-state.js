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
            this.showModSelection();
        } else {
            this.game.state.add('game', new GameState(), true);
        }

        this.cursorSection = CURSOR_SECTION_MODS;

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
        this.controls.onDown(leadingPlayer, 'SELECT', this.selectOption.bind(this));
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

    showModSelection()
    {
        this.showHeading();
        this.showModChoices();
        this.showPlayers();
    }

    showHeading()
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

    showModChoices()
    {
        const modChoices = this.getModChoices();
        const options = { fill: '#ffffff' };

        console.log('modChoices', modChoices);

        this.modChoiceTextObjects = [];
        modChoices.forEach((key, index) => {
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

    showPlayers()
    {
        const nonLeadingPlayers = score.getNonLeadingPlayers();

        nonLeadingPlayers.forEach((player, index) => {
            let playerSprite = this.game.make.sprite(
                this.game.width / 2 - 300 + (250 * index),
                300,
                'player'
            );
            playerSprite.tint = globalState.getPlayerColorInfo(player).hex
            this.game.world.addChild(playerSprite);
        });
    }

    moveCursorUp()
    {
        if (this.cursorSection === CURSOR_SECTION_MODS) {

        } else {

        }
        this.renderCursor();
    }

    moveCursorDown()
    {
        if (this.cursorSection === CURSOR_SECTION_MODS) {

        } else {

        }
        this.renderCursor();
    }

    selectOption()
    {
        if (this.cursorSection === CURSOR_SECTION_MODS) {

        } else {

        }
    }
}

export default ModificationState;
