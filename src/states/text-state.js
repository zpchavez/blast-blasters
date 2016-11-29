import AbstractState from './abstract-state';

class TextState extends AbstractState
{
    constructor(text, stateKey, stateObject, delay = 1000)
    {
        super();

        this.text = text;
        this.stateKey = stateKey;
        this.stateObject = stateObject;
        this.delay = delay;
    }

    create()
    {
        super.create();

        const text = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2,
            this.text,
            {
                fill: '#ffffff',
                font: '48px Arial'
            }
        );
        text.anchor.set(0.5);

        this.game.time.events.add(
            this.delay,
            () => {
                this.game.state.add(this.stateKey, this.stateObject, true);
            }
        );
    }
}

export default TextState;
