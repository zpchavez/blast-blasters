class AbstractState extends Phaser.State
{
    create()
    {
        this.game.input.onDown.add(this.toggleFullscreen, this);
    }

    toggleFullscreen()
    {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen(false);
        }
    }
}

export default AbstractState;
