class AbstractObject extends Phaser.Sprite
{
    addToCollisionGroup(collisionGroup)
    {
        this.collisionGroup = collisionGroup;
        this.body.setCollisionGroup(collisionGroup);
        this.body.collides(collisionGroup);
    }
}

export default AbstractObject;
