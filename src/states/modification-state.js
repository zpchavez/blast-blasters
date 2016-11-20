import AbstractState from './abstract-state';
import GameState from './game-state';
import TextState from './text-state';
import Controls from '../util/controls';
import globalState from '../util/global-state';
import score from '../util/score';
import rng from '../util/rng';
import ucfirst from '../util/ucfirst';
import colors from '../data/colors';
import mods from '../data/mods';
import Player from '../objects/player';

const MOD_CHOICES_COUNT = 2;
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
        let modChoices = null;
        if (score.getLead() > MOD_LEAD_THRESHOLD) {
            modChoices = this.getModChoices();
        }

        if (! modChoices || ! modChoices.length) {
            this.loadNextRound();
            return;
        }

        this.renderModSelection(modChoices);
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

        while (allMods.length > 0 && modChoices.length < MOD_CHOICES_COUNT) {
            if (allMods.length < 1) {
                break;
            }
            let modIndex = rng.between(0, allMods.length - 1);
            let pickedMod = allMods.splice(modIndex, 1)[0];
            let canAddModToAtLeastOnePlayer = false;
            score.getNonLeadingPlayers().forEach(player => {
                if (this.canAddModToPlayer(pickedMod, player)) {
                    canAddModToAtLeastOnePlayer = true;
                }
            });
            if (canAddModToAtLeastOnePlayer) {
                modChoices.push(pickedMod);
            }
        }

        return modChoices;
    }

    canAddModToPlayer(modKey, player)
    {
        return (
            ! globalState.getMod(player, modKey) ||
            globalState.getMod(player, modKey).level < mods[modKey].maxLevel
        );
    }

    canAddSelectedModToSelectedPlayer()
    {
        return this.canAddModToPlayer(
            this.modChoices[this.selectedMod],
            score.getNonLeadingPlayers()[this.selectedPlayer]
        );
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
            if (this.canAddSelectedModToSelectedPlayer()) {
                const nonLeadingPlayers = score.getNonLeadingPlayers();
                globalState.addMod(
                    nonLeadingPlayers[this.selectedPlayer],
                    this.modChoices[this.selectedMod]
                );
                this.controls.reset();
                this.loadNextRound();
            }
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

    renderModSelection(modChoices)
    {
        this.renderHeading();
        this.renderModChoices(modChoices);
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

    renderModChoices(modChoices)
    {
        this.modChoices = modChoices;
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
        nonLeadingPlayers.forEach((player, playerIndex) => {
            let playerSprite = this.game.make.sprite(
                this.game.width / 2 - 270 + (250 * playerIndex),
                300,
                'player'
            );
            playerSprite.tint = globalState.getPlayerColorInfo(player).hex
            this.playerSprites.push(playerSprite);
            this.game.world.addChild(playerSprite);

            Object.keys(globalState.get('mods')[player]).forEach((modKey, modIndex) => {
                let mod = globalState.get('mods')[player][modKey];
                let modLabel = mods[modKey].name;
                if (mod.level > 1) {
                    modLabel += ' ' + (new Array(mod.level - 1).fill('☆')).join('')
                }
                this.game.add.text(
                    this.game.width / 2 - 300 + (250 * playerIndex),
                    320 + ((modIndex + 1) * 30),
                    modLabel,
                    {
                        fill: '#ffffff',
                        font: '20px Arial',
                    }
                );
            });
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

            const fill = this.canAddSelectedModToSelectedPlayer() ? '#ffffff' : '#ff0000'

            this.cursor = this.game.add.text(
                selectedPlayer.x + 4,
                selectedPlayer.y - 30,
                '▼',
                {
                    fill,
                    font: '24px Arial'
                }
            );
        }
    }
}

export default ModificationState;
