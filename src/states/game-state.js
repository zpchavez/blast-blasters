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
    }

    create()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

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

    initPlayers()
    {
        this.player = Player.create(
            0,
            this.game,
            this.game.world.width / 2,
            this.game.world.height / 2
        );
        this.collisionGroup = this.game.physics.p2.createCollisionGroup();
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
