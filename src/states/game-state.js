import Player from '../objects/player';

class GameState extends Phaser.State
{
    preload() {
        Player.loadAssets(this);
    }

    create() {
        this.game.physics.startSystem(Phaser.Physics.P2);
        var player = Player.create(this.game, 20, 20);
        this.game.world.addChild(player);
    }

    update() {

    }

    shutdown() {

    }
}

export default GameState;
