import React, {ReactNode} from 'react';
import Icon from '@/components/Icon';
import type {ColourTheme} from '@/types/index';

interface Props {
    children: ReactNode;
    hasBorder?: boolean;
    icon?: string;
    isActive?: boolean;
    isSelected?: boolean;
    label?: string;
    styles?: Object;
    theme?: ColourTheme | string;
    type?: 'number' | 'string';
}

const Badge: React.FC<Props> = ({
    children,
    hasBorder,
    icon,
    isActive = true,
    isSelected,
    label,
    styles = {},
    theme = 'white',
    type
}: Props) => {
    let themeClasses = `bg-${theme}-100 border border-${theme}-200 text-${theme}-800 px-3 group-hover:bg-${theme}-200`;

    if (type === 'number') {
        themeClasses = 'bg-white bg-opacity-25 px-2 text-current';
    } else if (!isActive) {
        themeClasses = `bg-gray-100 border border-gray-200 text-gray-800 hover:bg-${theme}-100 hover:border-${theme}-200 hover:text-${theme}-800 px-3`;
    } else if (theme === 'white') {
        themeClasses = 'bg-white border border-gray-200 text-gray-800 px-3';
    }

    return (
        <span
            aria-label={label}
            title={label}
            className={`${
                hasBorder ? '' : 'border-none'
            } inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full py-1 text-xs font-medium leading-4 transition-colors duration-200 ${themeClasses}`}
            style={styles}
        >
            {isSelected && (
                <svg
                    className="-ml-0.5 mr-1.5 h-2 w-2 animate-fade-in"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                >
                    <circle cx="4" cy="4" r="3" />
                </svg>
            )}
            {icon && <Icon classes="-ml-0.5 mr-1.5 h-4 w-4" name={icon} />}
            {children}
        </span>
    );
};

export default Badge;
