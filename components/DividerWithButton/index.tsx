import React from 'react';
import Icon from '@/components/Icon';

interface Props {
    handleClick: Function;
    label: string;
}

const DividerWithButton: React.FC<Props> = ({handleClick, label}: Props) => (
    <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
            <button
                type="button"
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => handleClick()}
            >
                <Icon classes="-ml-1.5 mr-1 h-5 w-5 text-gray-400" name="plus" />
                <span>{label}</span>
            </button>
        </div>
    </div>
);

export default DividerWithButton;
