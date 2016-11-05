import AbstractObject from './abstract-object'
import Player from './player';

class Beam extends AbstractObject
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
                contactingBody.sprite.playerNumber !== this.shotBy
            ) {
                this.hit(contactingBody.sprite);
                this.destroy();
            } else if (! Player.prototype.isPrototypeOf(contactingBody.sprite)) {
                this.destroy();
            }
        }, this);
    }

    hit(player)
    {
        console.log('hit the player');
    }
}

Beam.create = (game, x, y) => {
    return new Beam(game, x, y, 'beam');
};

export default Beam;
