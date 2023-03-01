import React, {ReactNode, useEffect, useState} from 'react';
import ModalContext from './context';
import {ModalVisibility} from '@/types/index';

interface Props {
    children: ReactNode;
}

const ModalProvider: React.FC<Props> = ({children}: Props) => {
    const [renderKey, setRenderKey] = useState<number>(null);
    const [key, setKey] = useState(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [context, setContext] = useState(null);
    const [visibility, setVisibility] = useState<ModalVisibility>(ModalVisibility.HIDDEN);

    const hideModal = () => {
        setVisibility(ModalVisibility.LEAVING);

        setTimeout(() => {
            if (isMounted) {
                setVisibility(ModalVisibility.HIDDEN);
                setKey(null);
                setContext(null);
            }
        }, 1000);
    };

    const showModal = (key: string, modalContext?: any) => {
        setRenderKey(Date.now());
        setKey(key);
        setVisibility(ModalVisibility.VISIBLE);

        if (modalContext) {
            setContext(modalContext);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    return (
        <ModalContext.Provider
            value={{
                hideModal,
                modalContext: context,
                modalKey: key,
                renderKey,
                showModal,
                visibility
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export default ModalProvider;
