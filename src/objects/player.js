import { rotateVector } from '../util/math';
import AbstractObject from './abstract-object';
import Beam from './beam';

class Player extends AbstractObject
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);

        this.state = game.state;
        game.physics.p2.enable(this);
        this.body.mass = 5;
        this.body.damping = 0.99;
        this.aimAngle = Phaser.Math.degToRad(0);
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

    aim(angle)
    {
        this.aimAngle = angle;
    }

    fire()
    {
        let xRotation = Math.cos(this.aimAngle - (Math.PI / 180));
        let yRotation = Math.sin(this.aimAngle - (Math.PI / 180));
        let spawnPoint = [
            this.x + (xRotation),
            this.y + (yRotation),
        ];

        let beam = Beam.create(this.state.game, spawnPoint[0], spawnPoint[1]);
        beam.addToCollisionGroup(this.collisionGroup);
        this.game.world.addChild(beam);

        let velocity = rotateVector(this.aimAngle, [0, this.getBeamVelocity() * -1]);
        beam.body.velocity.x = velocity[0];
        beam.body.velocity.y = velocity[1];
        beam.shotBy = this.playerNumber;
    }

    getBeamVelocity()
    {
        return 800;
    }

    getAccelerationForce()
    {
        return 400;
    }
}

Player.create = (playerNum, game, x, y) => {
    var player = new Player(game, x, y, 'player');
    player.playerNum = playerNum;
    return player;
};

Player.loadAssets = (state) => {
    state.load.image('player', 'assets/img/player.png');
    state.load.image('beam', 'assets/img/basic-beam.png');
};

export default Player;
