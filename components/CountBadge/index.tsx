import React from 'react';
import type {ColourTheme} from '@/types/index';

interface Props {
    count: number;
    label: string;
    theme?: ColourTheme | string;
}

const CountBadge: React.FC<Props> = ({count, label, theme = 'white'}: Props) => {
    let themeClasses = `bg-${theme}-100 text-${theme}-800 group-hover:bg-${theme}-200`;

    return (
        <span
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium leading-4 transition duration-200 ${themeClasses}`}
        >
            <span className="mr-2 text-xl font-bold">{count || 0}</span>
            {label}
        </span>
    );
};

export default CountBadge;
