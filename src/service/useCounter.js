import { useState, useRef, useEffect } from 'react';
import { AppState } from 'react-native';

export function useCountdown(durationSeconds, onFinish) {
    const [remaining, setRemaining] = useState(0);
    const finishRef = useRef(null);
    const timerRef = useRef(null);
    const appState = useRef(AppState.currentState);

    const tick = () => {
        if (!finishRef.current) return;
        const rem = Math.max(0, Math.ceil((finishRef.current - Date.now()) / 1000));
        setRemaining(rem);
        if (rem <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            onFinish?.();
        }
    };

    const start = () => {
        finishRef.current = Date.now() + durationSeconds * 1000;
        setRemaining(durationSeconds);
        tick();
        if (!timerRef.current) {
            timerRef.current = setInterval(tick, 1000);
        }
    };

    useEffect(() => {
        const sub = AppState.addEventListener('change', next => {
            const prev = appState.current;
            if (prev.match(/inactive|background/) && next === 'active') {
                tick();
                if (finishRef.current && finishRef.current > Date.now()) {
                    if (!timerRef.current) timerRef.current = setInterval(tick, 1000);
                }
            } else if (prev === 'active' && next.match(/inactive|background/)) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
            appState.current = next;
        });

        return () => {
            sub.remove();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return { remaining, start };
}
