export default class DelayTimer
{
    constructor(game)
    {
        this.game = game;
    }

    setTimeout(callback, time)
    {
        return new Promise(resolve => {
            game.time.events.add(
                time,
                () => {
                    callback();
                    resolve();
                }
            );
        });
    }
}
