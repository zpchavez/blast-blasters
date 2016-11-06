import queryString from 'query-string';
import Player from '../objects/player';
import Controls, {
    FIRE,
    LEFT_STICK,
    RIGHT_STICK,
} from '../util/controls';
import globalState from '../util/global-state';

class GameState extends Phaser.State
{
    preload()
    {
        Player.loadAssets(this);

        this.load.tilemap(
            'map',
            'assets/maps/map1.json',
            null,
            Phaser.Tilemap.TILED_JSON
        );

        this.load.image(
            'tileset',
            'assets/maps/tileset.png'
        );
    }

    create()
    {
        this.numPlayers = queryString.parse(window.location.search).players || 1;

        globalState.setInitialScore(this.numPlayers);

        this.rng = new Phaser.RandomDataGenerator(
            [new Date().getTime().toString()]
        );

        this.initPhysics();
        this.initMap();
        this.initPlayers();
        this.initInputs();
    }

    update()
    {
        this.players.forEach((player, playerNumber) => {
            if (this.controls.isDown(playerNumber, LEFT_STICK)) {
                player.accelerate(this.controls.getLeftStickAngle(playerNumber));
            }
            if (this.controls.isDown(playerNumber, RIGHT_STICK)) {
                player.aim(this.controls.getRightStickAngle(playerNumber));
            }
        });
    }

    shutdown()
    {

    }

    initPhysics()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.collisionGroup = this.game.physics.p2.createCollisionGroup();
        this.game.physics.p2.contactMaterial.restitution = 0; // No bouncing
        this.game.physics.p2.contactMaterial.friction = 100;
    }

    initMap()
    {
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tileset', 'tileset');
        this.layer = this.map.createLayer('walls');
        this.layer.resizeWorld();
        this.map.setCollision(1, true, this.layer);
        let bodies = this.game.physics.p2.convertTilemap(this.map, this.layer);
        bodies.forEach(body => {
            body.setCollisionGroup(this.collisionGroup)
            body.collides(this.collisionGroup);
        });
    }

    initPlayers()
    {
        let playerNumber = 0;
        this.players = [];
        for (let playerNumber = 0; playerNumber < this.numPlayers; playerNumber += 1) {
            this.players.push(Player.create(playerNumber, this.game));
            this.players[playerNumber].addToCollisionGroup(this.collisionGroup);
            this.game.world.addChild(this.players[playerNumber]);
        }
        this.spawnPlayers();
    }

    initInputs()
    {
        this.controls = new Controls(this.game);
        this.players.forEach((player, playerNumber) => {
            this.controls.onDown(playerNumber, FIRE, () => {
                player.fire();
            });
        })
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
            const pointIndex = this.rng.between(0, spawnPoints.length - 1);
            const point = spawnPoints.splice(pointIndex, 1)[0];
            player.reset(point.x + 16, point.y + 16);
        });
    }
}

export default GameState;
