import { rotateVector } from '../util/math';
import AbstractObject from './abstract-object';
import Blast from './blast';
import globalState from '../util/global-state';
import colors from '../data/colors';
import delay from '../util/delay'

class Player extends AbstractObject
{
    constructor(game, x, y, key, frame, playerNum)
    {
        super(game, x, y, key, frame);

        this.playerNum = playerNum;
        this.state = game.state;
        this.initPhysics();
        this.aimAngle = null;
        this.dashState = 'READY';
        this.maxAmmo = this.getMaxAmmo();
        this.ammo = this.maxAmmo;

        this.cannonSprite = this.addChild(
            game.make.sprite(
                0,
                0,
                'cannon'
            )
        );
        this.cannonSprite.visible = false;
        this.cannonSprite.anchor.setTo(0.5, 0.5);
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
        if (this.ammo > 0) {
            this.cannonSprite.visible = true;
        }
        this.cannonSprite.rotation = angle;

        this.aimAngle = angle;
    }

    fire()
    {
        if (this.game === null || this.reloading || this.aimAngle === null) {
            return;
        }

        if (this.ammo === 0) {
            this.loadTexture('player-out-of-ammo');
            delay(this.loadTexture.bind(this, 'player'), 100);
            return;
        }

        this.ammo -= 1;

        let xRotation = Math.cos(this.aimAngle - (90 * Math.PI / 180));
        let yRotation = Math.sin(this.aimAngle - (90 * Math.PI / 180));
        let spawnPoint = [
            this.x + (24 * xRotation),
            this.y + (24 * yRotation),
        ];

        const blast = Blast.create(this.state.game, spawnPoint[0], spawnPoint[1]);
        const bounceMod = globalState.getMod(this.playerNum, 'BLAST_BOUNCE');
        blast.setBounces(bounceMod ? bounceMod.level : 0);
        blast.tint = colors[globalState.get('colors')[this.playerNum]].hex;
        blast.addToCollisionGroup(this.collisionGroup);
        this.game.world.addChild(blast);

        const velocity = rotateVector(this.aimAngle, [0, this.getBlastVelocity() * -1]);
        blast.body.velocity.x = velocity[0];
        blast.body.velocity.y = velocity[1];
        blast.shotBy = this.playerNum;

        if (this.ammo < 1) {
            this.cannonSprite.visible = false;
        }
    }

    reload()
    {
        if (this.game === null) {
            return;
        }

        this.reloading = true;
        this.cannonSprite.visible = false;
        this.loadTexture('player-reloading');
        delay(() => {
            this.reloading = false;
            this.ammo = this.maxAmmo;
            this.loadTexture('player');
            this.cannonSprite.visible = true;
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
        if (hitBy === this.playerNum && globalState.state.score[this.playerNum] > 0) {
            globalState.state.score[hitBy] -= 1;
        } else {
            globalState.state.score[hitBy] += 1;
        }
        this.getHitCallback(hitBy);
        this.destroy();
    }

    setGetHitCallback(callback)
    {
        this.getHitCallback = callback;
    }

    getMaxAmmo()
    {
        let extraAmmo = 0;
        const ammoMod = globalState.getMod(this.playerNum, 'AMMO_BLAMMO');
        if (ammoMod) {
            extraAmmo = 10 * ammoMod.level;
        }
        return 10 + extraAmmo;
    }

    getReloadDelay()
    {
        const fasterReloadMod = globalState.getMod(this.playerNum, 'FASTER_RELOAD');
        let reloadTimeSavings = 0;
        if (fasterReloadMod) {
            reloadTimeSavings = fasterReloadMod.level * 300;
        }
        return 1000 - reloadTimeSavings;
    }

    getBlastVelocity()
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
}

Player.create = (playerNum, game, x, y) => {
    var player = new Player(game, x, y, 'player', 0, playerNum);
    player.tint = colors[globalState.get('colors')[playerNum]].hex;
    return player;
};

Player.loadAssets = (state) => {
    state.load.image('player', 'assets/img/player.png');
    state.load.image('player-out-of-ammo', 'assets/img/player-out-of-ammo.png');
    state.load.image('player-reloading', 'assets/img/player-reloading.png');
    state.load.image('blast', 'assets/img/blast.png');
    state.load.image('cannon', 'assets/img/cannon.png');
};

export default Player;
