import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Transition from '@/components/Transition';
import strings from '@/locales/en.json';
import {ModalVisibility} from '@/types/index';

interface Props {
    cancelLabel?: string;
    children: ReactNode;
    handleClose?: any;
    subtitle?: string;
    text?: string;
    title?: string;
    visibility: ModalVisibility;
}

export const SlideOverContent: React.FC<Partial<Props>> = ({
    children,
    handleClose,
    subtitle,
    text,
    title
}: Props) => (
    <div className="h-0 flex-1 space-y-6 overflow-y-scroll py-6">
        <header className="px-4 sm:px-6">
            <div className="flex items-start justify-between space-x-3">
                {subtitle || text || title ? (
                    <div>
                        {subtitle && (
                            <span className="sm:text-md mb-2 text-sm font-normal leading-6 text-gray-500">
                                {subtitle}
                            </span>
                        )}
                        {title && (
                            <h2 className="text-lg font-medium leading-7 text-gray-900">{title}</h2>
                        )}
                        {text && <p className="my-2 text-sm text-gray-600">{text}</p>}
                    </div>
                ) : (
                    <div />
                )}
                <div className="flex h-7 items-center">
                    <button
                        aria-label="Close panel"
                        className="text-gray-400 transition duration-150 ease-in-out hover:text-gray-500"
                        onClick={handleClose}
                        type="button"
                    >
                        <Icon name="cross" classes="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
        <div className="relative flex-1 px-4 sm:px-6">{children}</div>
    </div>
);

export const SlideOverFooter: React.FC<Partial<Props>> = ({children, handleClose}: Props) => (
    <footer className="flex flex-shrink-0 justify-end space-x-4 bg-gray-50 px-4 py-4">
        <span className="inline-flex rounded-md shadow-sm">
            <Button onClick={handleClose} theme="white">
                {strings.generic.closeModal}
            </Button>
            {children ? <div className="ml-4">{children}</div> : null}
        </span>
    </footer>
);

export const SlideOver: React.FC<Props> = ({
    children,
    handleClose = () => {},
    subtitle,
    text,
    title,
    visibility
}: Props) => {
    const $container = useRef(null);
    const [$portalContainer, set$portalContainer] = useState(null);
    const [$slideOver, set$slideOver] = useState(null);

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
        if ($portalContainer) {
            $portalContainer.appendChild($slideOver);
        }

        return () => {
            if ($portalContainer) {
                $portalContainer.removeChild($slideOver);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [$slideOver]);

    useEffect(() => {
        set$portalContainer(document.getElementById('portals'));
        set$slideOver(document.createElement('div'));
    }, []);

    if (!$slideOver) {
        return null;
    }

    return createPortal(
        <div
            className={`fixed inset-0 overflow-hidden ${
                visibility === ModalVisibility.HIDDEN ? 'hidden' : ''
            }`}
        >
            <div className="fixed inset-0">
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
            </div>
            <div className="absolute inset-0 overflow-hidden">
                <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                    <div className="w-screen max-w-2xl md:max-w-4xl">
                        <Transition
                            show={visibility === ModalVisibility.VISIBLE}
                            containerClasses="h-full"
                            enter="transition ease-out duration-500 transform"
                            enterFrom="opacity-0 translate-x-full"
                            enterTo="opacity-100 translate-x-0"
                            leave="transition ease-in duration-100 transform"
                            leaveFrom="opacity-100 translate-x-0"
                            leaveTo="opacity-0 translate-x-full"
                        >
                            <div
                                className="flex h-full flex-col divide-y divide-gray-200 bg-gray-100 shadow-xl"
                                ref={$container}
                            >
                                {children}
                            </div>
                        </Transition>
                    </div>
                </section>
            </div>
        </div>,
        $slideOver
    );
};
