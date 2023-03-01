import React, {ReactNode, useEffect, useRef, useState} from 'react';
import ToastContext from './context';
import type {Toast} from '@/types/index';

interface Props {
    children: ReactNode;
}

const ToastProvider: React.FC<Props> = ({children}: Props) => {
    const isMounted = useRef(false);
    const [queue, setQueue] = useState([]);

    const removeToast = (index: number = 0) => {
        if (isMounted.current === true) {
            setQueue(previousQueue => {
                return previousQueue.filter((_, i) => i !== index);
            });
        }
    };

    const clearQueue = () => {
        if (isMounted.current === true) {
            setQueue([]);
        }
    };

    const addToast = (item: Toast) => {
        setQueue(previousQueue => {
            const newQueue = [...previousQueue, item];

            setTimeout(() => {
                removeToast();
            }, 3000 * newQueue.length);

            return newQueue;
        });
    };

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return (
        <ToastContext.Provider
            value={{addToast, clearToastQueue: clearQueue, removeToast, toastQueue: queue}}
        >
            {children}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
