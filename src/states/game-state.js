import Player from '../objects/player';
import Controls from '../util/controls';

class GameState extends Phaser.State
{
    preload() {
        Player.loadAssets(this);
    }

    create() {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.player = Player.create(
            this.game,
            this.game.world.width / 2,
            this.game.world.height / 2
        );
        this.game.world.addChild(this.player);

        this.initInputs();
    }

    update() {
        var leftStickAngle = this.controls.getLeftStickAngle(0);
        if (leftStickAngle !== false) {
            this.player.accelerate(leftStickAngle);
        }
    }

    shutdown() {

    }

    initInputs() {
        this.controls = new Controls(this.game);
    }
}

export default GameState;
