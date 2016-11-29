import AbstractState from './abstract-state';
import MainMenuState from './main-menu-state';
import queryString from 'query-string';
import Player from '../objects/player';
import Controls, {
    DASH,
    DOWN,
    FIRE,
    LEFT_STICK,
    PAUSE,
    RELOAD,
    RIGHT_STICK,
    SELECT,
    UP,
} from '../util/controls';
import globalState from '../util/global-state';
import ScoreboardState from './scoreboard-state';
import rng from '../util/rng';
import DelayTimer from '../util/delay';

const ROUND_TIME_LIMIT = 20000;
const PAUSE_MENU_RESUME = 1;
const PAUSE_MENU_EXIT = 2;

const menuStyle = {
    font: '32px Arial',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
};

class GameState extends AbstractState
{
    preload()
    {
        Player.loadAssets(this);

        this.load.audio('hurry-up', 'assets/sfx/hurry-up.wav');

        const mapToLoad = rng.between(1, 8);
        this.load.tilemap(
            'map',
            `assets/maps/map${mapToLoad}.json`,
            null,
            Phaser.Tilemap.TILED_JSON
        );

        this.load.image(
            'tileset',
            'assets/maps/tileset.png'
        );

        this.delayTimer = new DelayTimer(this.game);
    }

    create()
    {
        super.create();

        this.sfx = {
            hurryUp: this.game.add.audio('hurry-up'),
        };

        this.numPlayers = globalState.get('players');

        this.initPhysics();
        this.initMap();
        this.initPlayers();
        this.initInputs();
        this.initRoundTimer();
    }

    update()
    {
        if (this.isPaused()) {
            return;
        }

        this.players.forEach((player, playerNumber) => {
            if (this.controls.isDown(playerNumber, LEFT_STICK)) {
                player.accelerate(this.controls.getMovementStickAngle(playerNumber));
            }
            if (this.controls.isDown(playerNumber, RIGHT_STICK)) {
                player.aim(this.controls.getAimingStickAngle(playerNumber));
            }
        });

        let remainingPlayers = this.players.filter(player => player.game !== null).length;
        if (remainingPlayers <= 1) {
            this.delayTimer.setTimeout(this.endRound.bind(this), 1000);
        }
    }

    initRoundTimer()
    {
        this.roundTimer = this.game.time.create();
        this.roundTimer.add(ROUND_TIME_LIMIT, this.beginHurryUpSequence, this);
        this.roundTimer.start();
    }

    initPhysics()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.collisionGroup = this.game.physics.p2.createCollisionGroup();
        // Default contact material
        this.game.physics.p2.contactMaterial.restitution = 0; // No bouncing
        this.game.physics.p2.contactMaterial.friction = 100;
        const bouncyMaterial = this.game.physics.p2.createMaterial('bouncy');
        const bouncyContact = this.game.physics.p2.createContactMaterial(bouncyMaterial, bouncyMaterial);
        bouncyContact.restitution = 1;
        bouncyContact.friction = 0;
        globalState.set('bouncyMaterial', bouncyMaterial);
    }

    initMap()
    {
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tileset', 'tileset');
        this.layer = this.map.createLayer('walls');
        this.layer.resizeWorld();
        this.map.setCollision(1, true, this.layer);
        this.setWallPhysics();
    }

    setWallPhysics()
    {
        let bodies = this.game.physics.p2.convertTilemap(this.map, this.layer);
        bodies.forEach(body => {
            body.setCollisionGroup(this.collisionGroup)
            body.collides(this.collisionGroup);
            body.isWall = true;
            body.setMaterial(globalState.get('bouncyMaterial'));
        });
    }

    initPlayers()
    {
        let playerNumber = 0;
        this.players = [];
        this.playerKills = [];
        for (let playerNumber = 0; playerNumber < this.numPlayers; playerNumber += 1) {
            this.playerKills.push([])
            if (globalState.get('eliminatedPlayers').indexOf(playerNumber) !== -1) {
                continue;
            }
            this.players.push(Player.create(playerNumber, this.game));
            this.players[playerNumber].addToCollisionGroup(this.collisionGroup);
            this.players[playerNumber].setGetHitCallback(hitBy => {
                this.playerKills[hitBy].push(playerNumber);
            });
            this.game.world.addChild(this.players[playerNumber]);
        }
        this.spawnPlayers();
    }

    initInputs()
    {
        this.controls = new Controls(this.game);

        const ifUnpaused = (callback) => () => {
            if (! this.isPaused()) {
                return callback();
            } else {
                return;
            }
        };

        this.players.forEach((player, playerNumber) => {
            this.controls.onDown(playerNumber, UP, this.togglePauseMenuCursor.bind(this, player));
            this.controls.onDown(playerNumber, DOWN, this.togglePauseMenuCursor.bind(this, player));
            this.controls.onDown(playerNumber, SELECT, this.selectPauseMenuOption.bind(this, player));
            this.controls.onDown(playerNumber, PAUSE, this.togglePause.bind(this, player));
            this.controls.onDown(
                playerNumber,
                FIRE,
                () => {
                    if (this.isPaused()) {
                        this.selectPauseMenuOption(player);
                    } else {
                        player.fire();
                    }
                }
            );

            this.controls.onUp(playerNumber, FIRE, player.stopAutoFire.bind(player));
            this.controls.onDown(playerNumber, DASH, ifUnpaused(player.dash.bind(player)));
            this.controls.onDown(playerNumber, RELOAD, ifUnpaused(player.reload.bind(player)));
        });
    }

    togglePause(player)
    {
        if (this.isPaused() && this.pausedBy === player.playerNum) {
            this.unpause();
        } else if (! this.isPaused()){
            this.pause(player);
        }
    }

    pause(player)
    {
        this.game.time.events.pause();
        this.roundTimer.pause();
        if (this.hurryUpTimer) {
            this.hurryUpTimer.pause();
        }
        this.players.forEach(player => {
            if (player.autoFireTimer) {
                player.autoFireTimer.pause();
            }
        });
        this.pausedBy = player.playerNum;
        this.showPauseMenu(player);
        this.game.physics.p2.paused = true;
    }

    unpause()
    {
        this.game.time.events.resume();
        this.roundTimer.resume();
        if (this.hurryUpTimer) {
            this.hurryUpTimer.resume();
        }
        this.players.forEach(player => {
            if (player.autoFireTimer) {
                player.autoFireTimer.resume();
            }
        });
        this.hidePauseMenu();
        this.game.physics.p2.paused = false;
    }

    isPaused()
    {
        return this.game.physics.p2.paused;
    }

    hidePauseMenu()
    {
        this.menuGraphics.destroy();
        this.menuResumeText.destroy();
        this.menuExitText.destroy();
        this.menuCursor.destroy();
    }

    showPauseMenu(player)
    {
        this.menuGraphics = this.game.add.graphics(
            this.game.width / 2,
            this.game.height / 2
        );
        this.menuGraphics.beginFill(player.getColorInfo().hex, 0.9);
        this.menuGraphics.drawRect(
            -200,
            -100,
            400,
            200
        );
        this.menuGraphics.endFill();
        this.menuGraphics.generateTexture();

        this.menuResumeText = this.game.add.text(
            (this.game.width / 2) - 100,
            (this.game.height / 2) - 50,
            'Resume',
            menuStyle
        );

        this.menuExitText = this.game.add.text(
            (this.game.width / 2) - 100,
            (this.game.height / 2),
            'Exit to Main Menu',
            menuStyle
        );

        this.pauseMenuCursorPosition = PAUSE_MENU_RESUME;

        this.renderPauseMenuCursor();
    }

    renderPauseMenuCursor()
    {
        if (! this.pauseMenuCursorPosition) {
            this.pauseMenuCursorPosition = PAUSE_MENU_RESUME;
        }

        const selectedText = (
            this.pauseMenuCursorPosition === PAUSE_MENU_RESUME ?
            this.menuResumeText :
            this.menuExitText
        );

        if (this.menuCursor) {
            this.menuCursor.destroy();
        }

        this.menuCursor = this.game.add.text(
            selectedText.x - 50,
            selectedText.y,
            '▶',
            menuStyle
        )
    }

    togglePauseMenuCursor(player)
    {
        if (! this.isPaused() || this.pausedBy !== player.playerNum) {
            return;
        }

        if (this.pauseMenuCursorPosition === PAUSE_MENU_RESUME) {
            this.pauseMenuCursorPosition = PAUSE_MENU_EXIT;
        } else {
            this.pauseMenuCursorPosition = PAUSE_MENU_RESUME;
        }

        this.renderPauseMenuCursor();
    }

    selectPauseMenuOption(player) {
        if (! this.isPaused() || this.pausedBy !== player.playerNum) {
            return;
        }

        if (this.pauseMenuCursorPosition === PAUSE_MENU_RESUME) {
            this.unpause();
        } else if (this.pauseMenuCursorPosition === PAUSE_MENU_EXIT) {
            this.unpause();
            this.game.state.add('main-menu', new MainMenuState(), true);
        }
    }

    spawnPlayers()
    {
        const spawnPointsLayer = this.map.createLayer('spawn-points');
        spawnPointsLayer.visible = false;

        const spawnPoints = [];
        spawnPointsLayer.layer.data.forEach(row => {
            row.forEach(tile => {
                if (tile.index !== -1) {
                    spawnPoints.push(new Phaser.Point(tile.worldX, tile.worldY));
                }
            })
        });

        this.players.forEach(player => {
            const pointIndex = rng.between(0, spawnPoints.length - 1);
            const point = spawnPoints.splice(pointIndex, 1)[0];
            player.reset(point.x + 16, point.y + 16);
        });
    }

    beginHurryUpSequence()
    {
        this.sfx.hurryUp.play();

        this.hurryUpText = this.game.add.text(
            -150,
            (this.game.height / 2) - 42,
            'Hurry Up!',
            {
                font: '42px Arial',
                fill: '#ff0000',
                stroke: '#ffffff',
                strokeThickness: 5,
            }
        );
        this.hurryUpTimer = this.game.time.create();
        let hurryUpTextScrollEvent = this.hurryUpTimer.loop(5, () => {
            this.hurryUpText.x += 5;
            if (this.hurryUpText.x > this.game.width) {
                this.hurryUpTimer.remove(hurryUpTextScrollEvent);
            }
        }, this);
        this.hurryUpTimer.loop(100, this.addHurryUpTile, this);
        this.hurryUpTimer.start();
    }

    * getNextHurryUpTileGenerator()
    {
        const MAX_X = 39;
        const MAX_Y = 21;
        let xBeg = 0, yBeg = 0, xEnd = MAX_X, yEnd = MAX_Y;
        let x = 0, y = 0;

        while (!(x === 10 && y === 11)) {
            if (x < xEnd && y === yBeg) {
                x += 1;
            } else if (x === xEnd && y < yEnd) {
                if (y === yEnd - 1 && x === xEnd) {
                    xBeg += 1;
                    xEnd -= 1;
                }
                y += 1;
            } else if (y === yEnd && x >= xBeg) {
                if (x === xBeg && y === yEnd) {
                    yEnd -= 1;
                    yBeg += 1;
                }
                x -= 1;
            } else {
                y -= 1;
            }
            yield {x, y};
        }
        yield null;
    }

    addHurryUpTile()
    {
        let tilePos = null;
        let tile = null;

        if (! this.tilePosGen) {
            this.tilePosGen = this.getNextHurryUpTileGenerator();
        }
        do {
            tilePos = this.tilePosGen.next().value;
            if (tilePos === null) {
                tile = null;
            } else {
                tile = this.map.getTile(tilePos.x, tilePos.y, this.layer, true);
            }
        } while (tile && tile.index !== -1)

        if (tilePos) {
            this.map.putTile(1, tilePos.x, tilePos.y, this.layer);
            // If player is in this tile, destroy them
            for (let playerNum = 0; playerNum < this.numPlayers; playerNum += 1) {
                // Unless they are already destroyed
                if (this.players[playerNum].game === null) {
                    continue;
                }
                let tilePlayerIsOn = this.map.getTileWorldXY(
                    this.players[playerNum].x,
                    this.players[playerNum].y,
                    this.map.scaledTileWidth,
                    this.map.scaledTileHeight,
                    this.layer,
                    true
                );
                if (tilePlayerIsOn.x === tile.x && tilePlayerIsOn.y === tile.y) {
                    this.players[playerNum].dieByMapHazard();
                }
            }
            this.setWallPhysics();
        } else {
            this.hurryUpTimer.destroy();
            this.hurryUpTimer = null;
        }
    }

    endRound()
    {
        this.game.state.add(
            'round-score',
            new ScoreboardState(this.playerKills),
            true
        );
    }
}

export default GameState;
