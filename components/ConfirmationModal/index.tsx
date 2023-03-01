import React from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import type {CTA} from '@/types/index';
import {ModalVisibility} from '@/types/index';

interface Props {
    cancelCta: CTA;
    confirmCta: CTA;
    handleHide: Function;
    title?: string;
    text?: string;
    visibility: ModalVisibility;
}

const ConfirmationModal = ({cancelCta, confirmCta, handleHide, title, text, visibility}: Props) => (
    <Modal handleClose={handleHide} visibility={visibility}>
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                {title && (
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
                        {title}
                    </h3>
                )}
                {text && (
                    <div className="mt-2">
                        <p className="text-sm leading-5 text-gray-500">{text}</p>
                    </div>
                )}
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:ml-10 sm:flex sm:pl-4">
            <span className="flex w-full rounded-md shadow-sm sm:w-auto">
                <Button data-testid="modal-confirm" onClick={confirmCta.onClick} type="button">
                    {confirmCta.label}
                </Button>
            </span>
            <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:w-auto">
                <Button
                    theme="white"
                    data-testid="modal-cancel"
                    onClick={cancelCta.onClick}
                    type="button"
                >
                    {cancelCta.label}
                </Button>
            </span>
        </div>
    </Modal>
);

export default ConfirmationModal;
