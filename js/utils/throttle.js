export function throttle(func, delay) {
    let lastExecTime = 0;
    return function(...args) {
        const currentTime = Date.now();
        if (currentTime - lastExecTime >= delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        }
    }
}