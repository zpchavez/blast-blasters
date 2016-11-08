import { rotateVector } from '../util/math';
import AbstractObject from './abstract-object';
import Projectile from './projectile';
import ChargedProjectile from './charged-projectile';
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

        this.aimAngle = null;
        this.dashState = 'READY';
        this.chargeState = 'NOT_CHARGED';
        this.maxAmmo = 10;
        this.ammo = this.maxAmmo;

        this.animations.add('charging', [0, 1], 6, true);
        this.animations.add('charged', [0, 1], 24, true);
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
        this.body.fixedRotation = true;
    }

    accelerate(angle)
    {
        if (this.game === null) {
            return;
        }

        this.body.applyForce(
            rotateVector(
                angle,
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

    charge()
    {
        if (this.game === null) {
            return;
        }

        if (this.ammo < 1) {
            this.loadTexture('player-out-of-ammo');
            delay(this.loadTexture.bind(this, 'player'), 100);
            return;
        }

        this.animations.play('charging');
        this.chargeState = 'CHARGING';
        this.chargeEvent = this.game.time.events.add(this.getChargeTime(), () => {
            if (this.isCharging()) {
                this.chargeState = 'CHARGED';
                this.animations.play('charged');
            }
        });
    }

    stopCharging()
    {
        if (this.game === null) {
            return;
        }

        this.chargeState = 'NOT_CHARGED';
        this.animations.stop();
        this.frame = 0;
        this.game.time.events.remove(this.chargeEvent);
    }

    isCharging()
    {
        return this.chargeState === 'CHARGING';
    }

    isCharged()
    {
        return this.chargeState === 'CHARGED';
    }

    fire()
    {
        if (this.game === null || this.reloading || this.ammo < 1 || this.aimAngle === null) {
            this.stopCharging();
            return;
        }

        let ProjectileClass = null;
        if (this.isCharged()) {
            ProjectileClass = ChargedProjectile;
        } else {
            ProjectileClass = Projectile;
        }

        this.ammo -= 1;

        let xRotation = Math.cos(this.aimAngle - (Math.PI / 180));
        let yRotation = Math.sin(this.aimAngle - (Math.PI / 180));
        let spawnPoint = [
            this.x + (xRotation),
            this.y + (yRotation),
        ];

        let projectile = ProjectileClass.create(this.state.game, spawnPoint[0], spawnPoint[1]);
        projectile.tint = colors[globalState.get('colors')[this.playerNum]].hex;
        projectile.addToCollisionGroup(this.collisionGroup);
        this.game.world.addChild(projectile);

        let velocity = rotateVector(this.aimAngle, [0, this.getProjectileVelocity() * -1]);
        projectile.body.velocity.x = velocity[0];
        projectile.body.velocity.y = velocity[1];
        projectile.shotBy = this.playerNum;

        this.stopCharging();
    }

    reload()
    {
        if (this.game === null) {
            return;
        }

        this.reloading = true;
        this.loadTexture('player-reloading');
        delay(() => {
            this.reloading = false;
            this.ammo = this.maxAmmo;
            this.loadTexture('player');
        }, this.getReloadDelay());
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

    getReloadDelay()
    {
        return 1000;
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
        if (this.reloading) {
            return 0;
        }

        return 400 * this.getAccelerationMultiplier();
    }

    getChargeTime()
    {
        return 1000;
    }
}

Player.create = (playerNum, game, x, y) => {
    var player = new Player(game, x, y, 'player', 0);
    player.playerNum = playerNum;
    player.tint = colors[globalState.get('colors')[playerNum]].hex;
    return player;
};

Player.loadAssets = (state) => {
    state.load.atlas('player', 'assets/img/player.png', 'assets/img/player.json');
    state.load.image('player-out-of-ammo', 'assets/img/player-out-of-ammo.png');
    state.load.image('player-reloading', 'assets/img/player-reloading.png');
    state.load.image('projectile', 'assets/img/basic-projectile.png');
    state.load.image('charged-projectile', 'assets/img/charged-projectile.png');
};

export default Player;
