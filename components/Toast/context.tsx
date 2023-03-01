import {createContext} from 'react';

const ToastContext = createContext({
    addToast: (item: Object) => null,
    clearToastQueue: () => null,
    removeToast: (index: number | string) => null,
    toastQueue: []
});

export default ToastContext;
