import AbstractObject from './abstract-object'
import Player from './player';

class Projectile extends AbstractObject
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);

        this.state = game.state;
        this.initPhysics(this.state);
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

        this.body.damping = 0;

        this.body.data.shapes.forEach(shape => {
            shape.sensor = true;
        });

        this.body.onBeginContact.add(function (contactingBody) {
            if (Player.prototype.isPrototypeOf(contactingBody.sprite) &&
                contactingBody.sprite.playerNum !== this.shotBy
            ) {
                contactingBody.sprite.getHit(this.shotBy);
                this.destroy();
            } else if (! Player.prototype.isPrototypeOf(contactingBody.sprite)) {
                this.destroy();
            }
        }, this);
    }
}

Projectile.create = (game, x, y) => {
    return new Projectile(game, x, y, 'projectile');
};

export default Projectile;
