import AbstractObject from './abstract-object'
import Player from './player';
import globalState from '../util/global-state';

class Projectile extends AbstractObject
{
    constructor(game, x, y, key, frame)
    {
        super(game, x, y, key, frame);

        this.state = game.state;
        this.createPhysicsBody(this.state);
    }

    update()
    {
        if (! this.inCamera) {
            this.destroy();
        }
    }

    createPhysicsBody()
    {
        this.state.game.physics.p2.enable(this);

        this.body.data.shapes.forEach(shape => {
            shape.sensor = true;
        });

        this.body.onBeginContact.add(function (contactingBody) {
            if (Player.prototype.isPrototypeOf(contactingBody.sprite) &&
                contactingBody.sprite.playerNum !== this.shotBy
            ) {
                this.hit(this.shotBy, contactingBody.sprite);
                this.destroy();
            } else if (! Player.prototype.isPrototypeOf(contactingBody.sprite)) {
                this.destroy();
            }
        }, this);
    }

    hit(shotBy, player)
    {
        player.destroy();
        globalState.state.score[shotBy] += 1;
    }
}

Projectile.create = (game, x, y) => {
    return new Projectile(game, x, y, 'projectile');
};

export default Projectile;
