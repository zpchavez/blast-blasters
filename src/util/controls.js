class Controls
{
    constructor(game)
    {
        this.onLeftStickChangedCallbacks = new Array(4).fill(() => {});

        this.leftStickX = [0, 0, 0, 0];
        this.leftStickY = [0, 0, 0, 0];

        for (var player = 0; player < 4; player += 1) {
            game.input.gamepad['pad' + (player + 1)].onAxisCallback = (
                this.getGamepadAxisCallback(player)
            );
        }

        game.input.gamepad.start();

        this.game = game;
    }

    getGamepadAxisCallback(player) {
        return (pad, button, value) => {
            let leftStickChanged = false;
            if (button === Phaser.Gamepad.XBOX360_STICK_LEFT_X) {
                this.leftStickX[player] = value;
                leftStickChanged = true;
            } else if (button === Phaser.Gamepad.XBOX360_STICK_LEFT_Y) {
                this.leftStickY[player] = value;
                leftStickChanged = true;
            }

            if (leftStickChanged && this.onLeftStickChangedCallbacks[player]) {
                this.onLeftStickChangedCallbacks[player](this.getLeftStickAngle(player));
            }
        };
    }

    getLeftStickAngle(player) {
        var x, y;
        x = this.leftStickX[player];
        y = this.leftStickY[player];

        if (x === 0 && y === 0) {
            return false;
        }

        var rad = Math.atan2(y, x) + Phaser.Math.degToRad(90);
        return rad;
    }

    onLeftAxisChanged(player, callback) {
        this.onLeftStickChangedCallbacks[player] = callback;
    }
}

export default Controls;
