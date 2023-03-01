import {useEffect, useRef} from 'react';

const useInterval = (callback: Function, delay: null | number) => {
    const savedCallback = useRef<Function>();

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current();
            }
        };

        const id = setInterval(tick, delay);

        return () => clearInterval(id);
    }, [delay]);
};

export default useInterval;
