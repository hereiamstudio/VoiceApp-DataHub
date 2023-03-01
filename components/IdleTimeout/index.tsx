import React, {useContext, useRef, useState} from 'react';
import {signOut} from 'next-auth/react';
import {useIdleTimer} from 'react-idle-timer';
import AlertModal from '@/components/AlertModal';
import ModalContext from '@/components/Modal/context';
import strings from '@/locales/en.json';

interface Props {
    logoutTimeout?: number;
    warningTimeout?: number;
}

// 5 minutes timeout before being logged out after being asked to contue
export const LOGOUT_TIME = 60 * 5 * 1000;

// 15 minutes timeout before being presented with modal
export const TIMEOUT_TIME = 60 * 15 * 1000;

const IdleTimeout = ({logoutTimeout = LOGOUT_TIME, warningTimeout = TIMEOUT_TIME}: Props) => {
    const logoutTimeoutRef = useRef(null);
    const [isIdle, setIsIdle] = useState(false);
    const {hideModal, showModal, visibility} = useContext(ModalContext);

    const showWarningModal = () => {
        pause();
        setIsIdle(true);
        showModal('idleTimeout');

        logoutTimeoutRef.current = setTimeout(() => {
            signOut();
        }, logoutTimeout);
    };

    const hideWarningModal = () => {
        reset();
        resume();
        hideModal();
        setTimeout(() => setIsIdle(false), 1000);
        if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
        }
    };

    const {reset, pause, resume} = useIdleTimer({
        debounce: 1000,
        onIdle: showWarningModal,
        timeout: warningTimeout
    });

    if (!isIdle) {
        return null;
    }

    return (
        <AlertModal
            cancelCta={{
                label: strings.idleTimeout.cancel,
                onClick: () => signOut()
            }}
            confirmCta={{
                label: strings.idleTimeout.confirm,
                onClick: () => hideWarningModal()
            }}
            handleHide={hideWarningModal}
            name="timeout"
            text={strings.idleTimeout.text}
            title={strings.idleTimeout.title}
            type="error"
            visibility={visibility}
        />
    );
};

export default IdleTimeout;
