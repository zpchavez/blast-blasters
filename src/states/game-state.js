import Player from '../objects/player';
import Controls, { LEFT_STICK } from '../util/controls';

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
        if (this.controls.isDown(0, LEFT_STICK)) {
            this.player.accelerate(this.controls.getLeftStickAngle(0));
        }
    }

    shutdown() {

    }

    initInputs() {
        this.controls = new Controls(this.game);
    }
}

export default GameState;
