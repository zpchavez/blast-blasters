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
            this.player.accelerate(this.controls.getLeftStickAngle(0));
        }
        if (this.controls.isDown(0, RIGHT_STICK)) {
            this.player.aim(this.controls.getRightStickAngle(0));
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
        this.player = Player.create(
            0,
            this.game,
            this.game.world.width / 2,
            this.game.world.height / 2 - 200
        );
        this.player.addToCollisionGroup(this.collisionGroup);
        this.game.world.addChild(this.player);
    }

    initInputs()
    {
        this.controls = new Controls(this.game);
        this.controls.onDown(0, FIRE, () => {
            this.player.fire();
        });
    }
}

export default GameState;
