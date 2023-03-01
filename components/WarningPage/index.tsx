import React from 'react';
import Button from '@/components/Button';

interface Props {
    ctaLabel: string;
    ctaUrl: string;
    text: string;
    title: string;
}

const WarningPage: React.FC<Props> = ({ctaLabel, ctaUrl, text, title}: Props) => (
    <div className="fixed inset-0 inset-x-0 flex items-center justify-center p-0 px-2">
        <div className="transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl transition-all sm:w-full sm:max-w-sm sm:p-6">
            <div>
                <svg
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="mx-auto h-8 w-8"
                >
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="mt-2 text-center">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
                        {title}
                    </h3>
                    <div className="mt-2 px-2 sm:px-6">
                        <p className="text-sm leading-5 text-gray-500">{text}</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-6">
                <span className="flex w-full rounded-md shadow-sm">
                    <Button url={ctaUrl} classes="justify-center w-full">
                        {ctaLabel}
                    </Button>
                </span>
            </div>
        </div>
    </div>
);

export default WarningPage;
