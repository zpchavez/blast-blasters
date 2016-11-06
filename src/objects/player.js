import { rotateVector } from '../util/math';
import AbstractObject from './abstract-object';
import Projectile from './projectile';
import globalState from '../util/global-state';
import colors from '../data/colors';
import delay from '../util/delay'

class Player extends AbstractObject
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);

        this.state = game.state;
        this.initPhysics();
        this.aimAngle = Phaser.Math.degToRad(0);
        this.dashState = 'READY';
    }

    update()
    {
        if (this.game === null) {
            return;
        }

        this.game.world.wrap(this.body);
    }

    initPhysics()
    {
        this.state.game.physics.p2.enable(this);
        this.body.mass = 5;
        this.body.damping = 0.99;
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

        let projectile = Projectile.create(this.state.game, spawnPoint[0], spawnPoint[1]);
        projectile.tint = colors[globalState.get('colors')[this.playerNum]].hex;
        projectile.addToCollisionGroup(this.collisionGroup);
        this.game.world.addChild(projectile);

        let velocity = rotateVector(this.aimAngle, [0, this.getProjectileVelocity() * -1]);
        projectile.body.velocity.x = velocity[0];
        projectile.body.velocity.y = velocity[1];
        projectile.shotBy = this.playerNum;
    }

    dash()
    {
        if (this.dashState !== 'READY') {
            return;
        }

        this.dashState = 'DASHING';
        delay(
            () => {
                this.dashState = 'POST_DASH'
            },
            500
        )
        .then(delay.bind(
            this,
            () => {
                this.dashState = 'COOLDOWN';
            },
            500
        ))
        .then(delay.bind(
            this,
            () => {
                this.dashState = 'READY';
            },
            500
        ));
    }

    getHit(hitBy)
    {
        globalState.state.score[hitBy] += 1;
        this.getHitCallback(hitBy);
        this.destroy();
    }

    setGetHitCallback(callback)
    {
        this.getHitCallback = callback;
    }

    getProjectileVelocity()
    {
        return 800;
    }

    getDashMultiplier()
    {
        switch (this.dashState) {
            case 'READY':
            case 'COOLDOWN':
                return 1;
            case 'DASHING':
                return 3;
            case 'POST_DASH':
                return 0.3;
        }
    }

    getAccelerationMultiplier()
    {
        return this.getDashMultiplier();
    }

    getAccelerationForce()
    {
        return 400 * this.getAccelerationMultiplier();
    }
}

Player.create = (playerNum, game, x, y) => {
    var player = new Player(game, x, y, 'player');
    player.playerNum = playerNum;
    player.tint = colors[globalState.get('colors')[playerNum]].hex;
    return player;
};

Player.loadAssets = (state) => {
    state.load.image('player', 'assets/img/player.png');
    state.load.image('projectile', 'assets/img/basic-projectile.png');
};

export default Player;
