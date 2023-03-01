import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import Transition from '@/components/Transition';
import {ModalVisibility} from '@/types/index';

interface Props {
    children: ReactNode;
    handleClose?: Function;
    widthClasses?: string;
    visibility: ModalVisibility;
}

const Modal: React.FC<Props> = ({
    children,
    handleClose = () => {},
    widthClasses = 'sm:max-w-lg',
    visibility
}: Props) => {
    const $container = useRef(null);
    const [$portalContainer, set$portalContainer] = useState(null);
    const [$modal, set$modal] = useState(null);

    const handleKeyDown = ({key}) => {
        if (key === 'Escape') {
            handleClose();
        }
    };

    const handleClick = event => {
        if (!$container?.current?.contains(event.target)) {
            if (visibility === ModalVisibility.VISIBLE) {
                handleClose();
            }
        }
    };

    useEffect(() => {
        if (visibility === ModalVisibility.VISIBLE) {
            window.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClick);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClick);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibility]);

    useEffect(() => {
        set$portalContainer(document.getElementById('portals'));
        set$modal(document.createElement('div'));
    }, []);

    useEffect(() => {
        if ($portalContainer) {
            $portalContainer.appendChild($modal);
        }

        return () => {
            if ($portalContainer) {
                $portalContainer.removeChild($modal);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [$modal]);

    if (!$modal) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-x-0 bottom-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center"
            style={visibility === ModalVisibility.HIDDEN ? {display: 'none'} : null}
            data-testid="modal"
        >
            <Transition
                show={visibility === ModalVisibility.VISIBLE}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </Transition>

            <Transition
                show={visibility === ModalVisibility.VISIBLE}
                containerClasses="h-screen  sm:inset-0 sm:flex sm:items-center sm:justify-center"
                enter="transition ease-out duration-500 transform"
                enterFrom="opacity-0 scale-110"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`mx-auto transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl transition-all sm:w-full sm:p-6 ${widthClasses}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline"
                >
                    <div className="mx-auto w-full" ref={$container}>
                        {children}
                    </div>
                </div>
            </Transition>
        </div>,
        $modal
    );
};

export default Modal;
