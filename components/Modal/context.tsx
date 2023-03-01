import {createContext} from 'react';
import {ModalVisibility} from '@/types/index';

const ModalContext = createContext({
    hideModal: () => null,
    modalContext: null,
    modalKey: null,
    renderKey: null,
    showModal: (key: string, context?: any) => null,
    visibility: ModalVisibility.HIDDEN
});

export default ModalContext;
