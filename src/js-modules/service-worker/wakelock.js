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

/** Request a wakelock. */
async function request() {
    wakeLockSentinel = await navigator.wakeLock?.request?.('screen');
}

/** Release the current wakelock. */
async function release() {
    if (!wakeLockSentinel) return;

    await wakeLockSentinel.release();
    wakeLockSentinel = undefined;
}