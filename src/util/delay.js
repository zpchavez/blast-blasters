export default function delay(callback, time) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve();
        }, time);
    });
};
