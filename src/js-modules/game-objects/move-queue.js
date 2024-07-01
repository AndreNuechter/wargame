const move_queue = [];

export default move_queue;

// save state
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        localStorage.setItem('wargame-planned-moves', JSON.stringify(
            move_queue.map((player_moves) => player_moves
                .map(({ origin, target, units }) => ({
                    origin: { cx: origin.cx, cy: origin.cy },
                    target: { cx: target.cx, cy: target.cy },
                    units
                }))
            )
        ));
    }
});