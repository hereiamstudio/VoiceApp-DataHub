import React from 'react';
import Icon from '@/components/Icon';
import Link from '@/components/Link';
import type {CTA} from '@/types/index';
import {RequestType} from '@/types/request';
import ActivityIndicator from '../ActivityIndicator';

const BUTTON_CLASSES = {
    primary:
        'text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-700 focus:ring-pink-300 focus:border-pink-400',
    secondary:
        'text-pink-700 border-pink-100 bg-pink-100 hover:bg-pink-200 active:bg-pink-200 focus:ring-pink-200 focus:border-pink-300',
    white: 'border-gray-200 text-gray-700 bg-white hover:text-gray-500 hover:bg-gray-50 hover:border-gray-300 focus:ring-pink-200 focus:border-pink-300',
    grey: 'border-gray-300 text-gray-700 bg-gray-200 hover:text-gray-500 active:bg-gray-100 active:text-gray-700',
    basic: 'border-transparent text-current hover:text-gray-900 active:bg-gray-100 active:text-gray-700',
    destructive:
        'text-red-700 border-red-100 bg-red-100 hover:bg-red-600 hover:border-red-600 focus:ring-red-500 focus:border-red-500 hover:text-white',
    destructiveOnHover:
        'border-gray-100 text-gray-700 bg-gray-50 hover:bg-red-50 active:bg-red-200',
    orderAndDestructiveOnHover:
        'border-gray-200 border-2 border-dashed text-gray-700 bg-gray-50 hover:bg-yellow-50 active:bg-yellow-200 py-[12px] hover:border-gray-300 focus:outline-none focus:border-gray-400 active:shadow-xl active:opacity-70 active:scale-95'
};

const Button = ({
    children,
    classes,
    icon,
    iconPosition = 'right',
    labelFlex,
    labelGrow,
    state = RequestType.DEFAULT,
    theme = 'primary',
    ...props
}: Partial<CTA>) => {
    const renderButtonChild = () => {
        if (state === RequestType.PENDING) {
            return <ActivityIndicator />;
        } else if (state === RequestType.SUCCESS) {
            return (
                <span data-testid="button-success">
                    <Icon classes="h-5 w-5" name="check" />
                </span>
            );
        } else {
            return (
                <>
                    {icon && iconPosition === 'left' && (
                        <Icon classes="flex-shrink-0 -ml-1 mr-2 h-5 w-5" name={icon} />
                    )}
                    {labelGrow ? (
                        <span
                            className={`${
                                props.classes && props.classes.includes('text-center')
                                    ? 'text-center'
                                    : 'text-left'
                            } ${labelFlex ? 'flex flex-row items-start' : ''} flex-grow`}
                        >
                            {children}
                        </span>
                    ) : (
                        children
                    )}
                    {icon && iconPosition === 'right' && (
                        <Icon classes="flex-shrink-0 -mr-1 ml-2 h-5 w-5" name={icon} />
                    )}
                </>
            );
        }
    };

    return (
        <Link
            classes={`group inline-flex items-center px-4 py-2 border font-medium text-sm leading-5 rounded-md outline-none transition duration-200 ease-in-out group ${
                BUTTON_CLASSES[theme]
            } ${classes ? classes : ''} ${props.disabled ? 'pointer-events-none opacity-75' : ''}`}
            {...props}
        >
            {renderButtonChild()}
        </Link>
    );
};

export default Button;
