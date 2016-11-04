import { rotateVector } from '../util/math';

class Player extends Phaser.Sprite
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);

        game.physics.p2.enable(this);
        this.body.mass = 5;
        this.body.damping = 0.99;
    }

    update()
    {
    }

    getPlayerRefVelocity()
    {
        return rotateVector(
            -this.body.rotation,
            [this.body.velocity.x, this.body.velocity.y]
        );
    };

    accelerate(angle)
    {
        this.body.rotation = angle;
        this.body.applyForce(
            rotateVector(
                this.body.rotation,
                [
                    0,
                    this.getAccelerationForce()
                ]
            ),
            0,
            0
        );
    }

    getAccelerationForce()
    {
        return 400;
    }
}

Player.create = (game, x, y) => {
    return new Player(game, x, y, 'player');
};

Player.loadAssets = (state) => {
    state.load.image('player', 'assets/img/player.png');
};

export default Player;
