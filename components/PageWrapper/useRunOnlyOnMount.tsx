import {useCallback, useEffect, useState} from 'react';

const useRunOnlyOnMount = (callback: () => void) => {
    const [hasRun, setHasRun] = useState<boolean>(false);

    const runCallback = useCallback(() => {
        if (!hasRun) {
            callback();
            setHasRun(true);
        }
    }, [callback, hasRun]);

    useEffect(() => {
        runCallback();
    }, [runCallback]);
};

export default useRunOnlyOnMount;
