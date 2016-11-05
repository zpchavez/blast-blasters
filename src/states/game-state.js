import Player from '../objects/player';
import Controls, {
    FIRE,
    LEFT_STICK,
    RIGHT_STICK,
} from '../util/controls';

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

        this.rng = new Phaser.RandomDataGenerator(
            [new Date().getTime().toString()]
        );
    }

    create()
    {
        this.initPhysics();
        this.initMap();
        this.initPlayers();
        this.initInputs();
    }

    update()
    {
        if (this.controls.isDown(0, LEFT_STICK)) {
            this.players[0].accelerate(this.controls.getLeftStickAngle(0));
        }
        if (this.controls.isDown(0, RIGHT_STICK)) {
            this.players[0].aim(this.controls.getRightStickAngle(0));
        }
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
        this.players = [];
        this.players.push(Player.create(0, this.game));
        this.players[0].addToCollisionGroup(this.collisionGroup);
        this.game.world.addChild(this.players[0]);
        this.spawnPlayers();
    }

    initInputs()
    {
        this.controls = new Controls(this.game);
        this.controls.onDown(0, FIRE, () => {
            this.players[0].fire();
        });
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
