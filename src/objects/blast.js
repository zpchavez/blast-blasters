import AbstractObject from './abstract-object'
import Player from './player';
import globalState from '../util/global-state';
import soundRegistry from '../util/sound-registry';
import colors from '../data/colors';
import { rotateVector } from '../util/math';

class Blast extends AbstractObject
{
    constructor(game, x, y, key, frame, rotation, shotBy)
    {
        super(game, x, y, key, frame);

        this.state = game.state;
        this.rotation = rotation;
        this.shotBy = shotBy;
        this.initPhysics(this.state);

        this.sfx = {
            hitWall: soundRegistry.addOrGet(game, 'hit-wall'),
            fizzle: soundRegistry.addOrGet(game, 'fizzle'),
            bounce: soundRegistry.addOrGet(game, 'bounce'),
        };

        this.blast();
    }

    blast()
    {
        let xRotation = Math.cos(this.rotation - (90 * Math.PI / 180));
        let yRotation = Math.sin(this.rotation - (90 * Math.PI / 180));
        this.reset(
            this.x + (32 * xRotation),
            this.y + (32 * yRotation),
        );

        const bounceMod = globalState.getMod(this.shotBy.playerNum, 'BLAST_BOUNCE');
        this.setBounces(bounceMod ? bounceMod.level : 0);
        this.tint = colors[globalState.get('colors')[this.shotBy.playerNum]].hex;
        this.addToCollisionGroup(this.shotBy.collisionGroup);
        this.game.world.addChild(this);

        const velocityVector = rotateVector(this.rotation, [0, this.shotBy.getBlastVelocity() * -1]);
        this.body.velocity.x = velocityVector[0];
        this.body.velocity.y = velocityVector[1];
    }

    setBounces(count)
    {
        this.bounces = count;
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

        this.body.setMaterial(globalState.get('bouncyMaterial'));

        this.body.dynamic = true;

        this.body.damping = 0;

        this.body.onBeginContact.add(function (contactingBody) {
            if (Player.prototype.isPrototypeOf(contactingBody.sprite)) {
                contactingBody.sprite.getHit(this.shotBy.playerNum);
                this.destroy();
            } else if (! Player.prototype.isPrototypeOf(contactingBody.sprite)) {
                if (contactingBody.isWall && this.bounces) {
                    this.bounces -= 1;
                    this.sfx.bounce.play();
                } else {
                    if (contactingBody.isWall) {
                        this.sfx.hitWall.play();
                    } else {
                        this.sfx.fizzle.play();
                    }
                    this.destroy();
                }
            }
        }, this);
    }
}

Blast.create = (game, x, y, rotation, shotBy) => {
    return new Blast(game, x, y, 'blast', 0, rotation, shotBy);
};

export default Blast;
