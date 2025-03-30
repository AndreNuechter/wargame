let wakeLockSentinel;

export default (() => {
    request();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            release();
        } else {
            request();
        }
    });
})();

async function request() {
    wakeLockSentinel = await navigator.wakeLock?.request?.('screen');
}

async function release() {
    if (!wakeLockSentinel) return;

    await wakeLockSentinel.release();
    wakeLockSentinel = undefined;
}