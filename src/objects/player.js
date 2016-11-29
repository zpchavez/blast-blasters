import { rotateVector } from '../util/math';
import AbstractObject from './abstract-object';
import Blast from './blast';
import globalState from '../util/global-state';
import colors from '../data/colors';
import DelayTimer from '../util/delay';
import soundRegistry from '../util/sound-registry';

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
            game.make.sprite(0, 0, 'cannon')
        );
        this.cannonSprite.visible = false;
        this.cannonSprite.anchor.setTo(0.5, 0.5);

        // With Blast Bounce mod, player is immune to one self hit per level
        const blastBounceMod = globalState.getMod(this.playerNum, 'BLAST_BOUNCE');
        this.selfieImmunity = blastBounceMod ? blastBounceMod.level : 0;

        const shieldMod = globalState.getMod(this.playerNum, 'SHIELD');
        this.shieldHp = shieldMod ? shieldMod.level : 0;
        if (this.shieldHp) {
            this.shieldSprite = this.addChild(
                game.make.sprite(0, 0, `shield-${shieldMod.level}`)
            );
            this.shieldSprite.tint = 0xf000ff;
            this.shieldSprite.anchor.setTo(0.5);
        }

        this.sfx = {
            blast: soundRegistry.addOrGet(game, 'blast'),
            reload: soundRegistry.addOrGet(game, 'reload'),
            hitPlayer: soundRegistry.addOrGet(game, 'hit-player'),
            dash: soundRegistry.addOrGet(game, 'dash'),
            pop: soundRegistry.addOrGet(game, 'pop'),
            shieldHit: soundRegistry.addOrGet(game, 'shield-hit'),
        };

        this.delayTimer = new DelayTimer(game);
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

    stopAutoFire()
    {
        if (this.autoFireTimer) {
            this.autoFireTimer.destroy();
            this.autoFireTimer = null;
        }
    }

    fire()
    {
        if (this.game === null || this.reloading || this.aimAngle === null) {
            return;
        }

        if (! this.autoFireTimer && globalState.getMod(this.playerNum, 'AUTO_BLASTER')) {
            this.autoFireTimer = this.game.time.create();
            this.autoFireTimer.loop(100, this.fire, this);
            this.autoFireTimer.start();
        }

        if (this.ammo === 0) {
            this.loadTexture('player-out-of-ammo');
            this.delayTimer.setTimeout(
                () => {
                    if (this.game === null) {
                        return;
                    }
                    this.loadTexture('player');
                },
                100
            );
            return;
        }

        this.ammo -= 1;

        const blast = Blast.create(
            this.state.game,
            this.x,
            this.y,
            this.aimAngle,
            this
        );

        this.sfx.blast.play();

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
        this.sfx.reload.play();
        this.delayTimer.setTimeout(() => {
            if (this.game === null) {
                return;
            }
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

        const dashRecoveryMod = globalState.getMod(this.playerNum, 'DASH_RECOVERY');
        let bonusTime = 0;
        if (dashRecoveryMod) {
            bonusTime = 150 * dashRecoveryMod.level;
        }

        this.dashState = 'DASHING';
        this.sfx.dash.play();
        this.delayTimer.setTimeout(
            () => {
                this.dashState = 'POST_DASH'
            },
            500
        )
        .then(this.delayTimer.setTimeout.bind(
            this,
            () => {
                this.dashState = 'COOLDOWN';
            },
            500 - bonusTime
        ))
        .then(this.delayTimer.setTimeout.bind(
            this,
            () => {
                this.dashState = 'READY';
            },
            500 - bonusTime
        ));
    }

    dieByMapHazard()
    {
        if (globalState.state.score[this.playerNum] > 0) {
            globalState.state.score[this.playerNum] -= 1;
        }
        this.sfx.hitPlayer.play();
        this.getHitCallback(this.playerNum);
        this.destroy();
    }

    getHit(hitBy)
    {
        if (this.shieldHp) {
            this.shieldHp -= 1;
            if (this.shieldHp) {
                this.shieldSprite.loadTexture(`shield-${this.shieldHp}`);
            } else {
                this.shieldSprite.visible = false;
            }
            this.sfx.shieldHit.play();
            return;
        }
        if (hitBy === this.playerNum && this.selfieImmunity > 0) {
            this.selfieImmunity -= 1;
            this.sfx.pop.play();
            return;
        }
        if (hitBy === this.playerNum) {
            if (globalState.state.score[this.playerNum] > 0) {
                globalState.state.score[hitBy] -= 1;
            }
        } else {
            const scoreBoostMod = globalState.getMod(hitBy, 'SCORE_BOOST');
            const scoreBonus = scoreBoostMod ? scoreBoostMod.level : 0;
            globalState.state.score[hitBy] += (1 + scoreBonus);
        }
        this.getHitCallback(hitBy);
        this.sfx.hitPlayer.play();
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
        const fasterBlasterMod = globalState.getMod(this.playerNum, 'FASTER_BLASTER');
        let speedBonus = 0;
        if (fasterBlasterMod) {
            speedBonus = 100 * fasterBlasterMod.level;
        }
        return 500 + speedBonus;
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

        const justPlainFasterMod = globalState.getMod(this.playerNum, 'JUST_PLAIN_FASTER');
        let speedBonus = 0;
        if (justPlainFasterMod) {
            speedBonus = 50 * justPlainFasterMod.level;
        }

        return (400 + speedBonus) * this.getAccelerationMultiplier();
    }

    getColorInfo()
    {
        return colors[globalState.state.colors[this.playerNum]];
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
    state.load.image('shield-1', 'assets/img/shield-1.png');
    state.load.image('shield-2', 'assets/img/shield-2.png');
    state.load.image('shield-3', 'assets/img/shield-3.png');
    state.load.audio('blast', 'assets/sfx/blast.wav');
    state.load.audio('bounce', 'assets/sfx/bounce.wav');
    state.load.audio('hit-player', 'assets/sfx/hit-player.wav');
    state.load.audio('hit-wall', 'assets/sfx/hit-wall.wav');
    state.load.audio('fizzle', 'assets/sfx/fizzle.wav');
    state.load.audio('pop', 'assets/sfx/pop.wav');
    state.load.audio('firework', 'assets/sfx/firework.wav');
    state.load.audio('shield-hit', 'assets/sfx/shield-hit.wav');
    state.load.audio('reload', 'assets/sfx/reload.wav');
    state.load.audio('dash', 'assets/sfx/dash.wav');
};

export default Player;
