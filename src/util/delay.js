export default class DelayTimer
{
    constructor(game)
    {
        this.game = game;
    }

    setTimeout(callback, time)
    {
        return new Promise(resolve => {
            if (this.game === null) {
                resolve();
            }

            this.game.time.events.add(
                time,
                () => {
                    callback();
                    resolve();
                }
            );
        });
    }
}
