import React from 'react';
import Button from '@/components/Button';
import type {CTA} from '@/types/index';

interface Props {
    cta?: CTA | null;
    text: string;
    title: string;
}

const ActionPanel: React.FC<Props> = ({cta, text, title}: Props) => (
    <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                    <div className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
                        <p>{text}</p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:flex-shrink-0 sm:items-center">
                    {cta && (
                        <span className="inline-flex rounded-md shadow-sm">
                            <Button
                                url={cta.url}
                                onClick={() => {
                                    if (cta.onClick) {
                                        cta.onClick();
                                    }
                                }}
                                {...cta}
                            >
                                {cta.label}
                            </Button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default ActionPanel;
