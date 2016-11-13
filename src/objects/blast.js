import AbstractObject from './abstract-object'
import Player from './player';
import globalState from '../util/global-state';

class Blast extends AbstractObject
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);

        this.state = game.state;
        this.initPhysics(this.state);
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
            if (Player.prototype.isPrototypeOf(contactingBody.sprite) &&
                contactingBody.sprite.playerNum !== this.shotBy
            ) {
                contactingBody.sprite.getHit(this.shotBy);
                this.destroy();
            } else if (! Player.prototype.isPrototypeOf(contactingBody.sprite)) {
                if (contactingBody.isWall && this.bounces) {
                    this.bounces -= 1;
                } else {
                    this.destroy();
                }
            }
        }, this);
    }
}

Blast.create = (game, x, y) => {
    return new Blast(game, x, y, 'blast');
};

export default Blast;
