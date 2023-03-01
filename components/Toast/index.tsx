import React from 'react';
import Icon from '@/components/Icon';
import type {Toast as ToastType} from '@/types/index';

interface Props {
    handleRemove?: Function;
    queue: Object[];
}

const Toast: React.FC<Props> = ({handleRemove, queue = []}: Props) => {
    if (queue && queue.length > 0) {
        const item: Partial<ToastType> = queue[0];

        return (
            <div
                className="pointer-events-none fixed inset-0 flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end sm:p-6"
                style={{zIndex: 200}}
            >
                <div className="animate-fade-in-up pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg">
                    <div className="shadow-xs overflow-hidden rounded-lg">
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {item.type === 'success' && (
                                        <Icon
                                            name="check-circle"
                                            classes="h-6 w-6 text-green-500"
                                        />
                                    )}
                                    {item.type === 'error' && (
                                        <Icon name="error" classes="h-6 w-6 text-red-500" />
                                    )}
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium leading-5 text-gray-900">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        {item.text}
                                    </p>
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        className="inline-flex text-gray-400 transition duration-150 ease-in-out focus:text-gray-500 focus:outline-none"
                                        onClick={() => {
                                            if (handleRemove) {
                                                handleRemove(0);
                                            }
                                        }}
                                    >
                                        <Icon name="cross" classes="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Toast;
