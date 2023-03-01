import React, {KeyboardEvent, MouseEvent, useCallback, useEffect, useRef, useState} from 'react';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import Icon from '@/components/Icon';
import Link from '@/components/Link';
import Transition from '@/components/Transition';
import type {CTA, ButtonTheme} from '@/types/index';

interface Props {
    display: 'inline' | 'block';
    label: string;
    options: CTA[];
    theme?: ButtonTheme;
}

const Dropdown: React.FC<Props> = ({
    display = 'inline',
    label,
    options = [],
    theme = 'white'
}: Props) => {
    const $dropdown = useRef(null);
    const [isActive, setIsActive] = useState(false);

    const handleLabelClick = () => {
        setIsActive(!isActive);
    };

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsActive(false);
        }
    }, []);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement | HTMLLinkElement>) => {
            if (!$dropdown?.current?.contains(event.target)) {
                setIsActive(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [$dropdown.current]
    );

    useEffect(() => {
        // @ts-ignore
        document.addEventListener('click', handleClick);
        // @ts-ignore
        document.addEventListener('keyup', handleEscape);

        return () => {
            // @ts-ignore
            document.removeEventListener('click', handleClick);
            // @ts-ignore
            document.removeEventListener('keyup', handleEscape);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={`relative text-left ${display === 'block' ? 'block' : 'inline-block'}`}
            ref={$dropdown}
        >
            <div>
                <span className="rounded-md shadow-sm">
                    <Button
                        aria-haspopup={isActive}
                        aria-expanded={isActive}
                        id="options-menu"
                        classes={display === 'block' ? 'text-left w-full' : ''}
                        data-testid="options-menu"
                        onClick={handleLabelClick}
                        theme={theme}
                        type="button"
                    >
                        <span className="flex-grow">{label}</span>
                        <svg
                            className={`-mr-1 ml-2 h-5 w-5 transform transition-all duration-200 ${
                                isActive ? '-rotate-180' : ''
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Button>
                </span>
            </div>
            <Transition
                show={isActive}
                enter="transition ease-out duration-200 relative z-50"
                enterFrom="transform opacity-0 scale-95 relative z-50"
                enterTo="transform opacity-100 scale-100 relative z-50"
                leave="transition ease-in duration-75 relative z-50"
                leaveFrom="transform opacity-100 scale-100 relative z-50"
                leaveTo="transform opacity-0 scale-95 relative z-50"
            >
                <div
                    className={`absolute right-0 mt-2 origin-top-right rounded-md shadow-lg ${
                        !isActive && 'hidden'
                    } ${display === 'block' ? 'w-full' : 'w-56'}`}
                >
                    <div
                        className="shadow-xs overflow-hidden rounded-md border bg-white"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        {options.map((option, index) => {
                            if (Array.isArray(option)) {
                                return (
                                    <div key={`${option}-${index}`}>
                                        {option
                                            .filter(o => o)
                                            .map(nestedOption => {
                                                return typeof nestedOption === 'string' ? (
                                                    <div
                                                        className="px-4 py-2 text-xs leading-4 text-gray-500"
                                                        key={nestedOption}
                                                    >
                                                        {nestedOption}
                                                    </div>
                                                ) : (
                                                    <Link
                                                        key={nestedOption.label}
                                                        classes="group flex items-center px-4 py-2 text-sm leading-5 text-gray-700 w-full hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 text-left"
                                                        role="menuitem"
                                                        {...nestedOption}
                                                        onClick={() => {
                                                            if (nestedOption.onClick) {
                                                                nestedOption.onClick();
                                                            }

                                                            setIsActive(false);
                                                        }}
                                                    >
                                                        {nestedOption.icon && (
                                                            <Icon
                                                                classes="h-4 mr-3 w-4"
                                                                name={nestedOption.icon}
                                                            />
                                                        )}
                                                        {nestedOption.label}
                                                    </Link>
                                                );
                                            })}
                                        {index < options.length - 1 && (
                                            <Divider paddingVertical="xs" />
                                        )}
                                    </div>
                                );
                            } else {
                                return typeof option === 'string' ? (
                                    <div
                                        className="px-4 py-2 text-xs leading-4 text-gray-500"
                                        key={option}
                                    >
                                        {option}
                                    </div>
                                ) : (
                                    <Link
                                        key={option.label}
                                        classes="group flex items-center px-4 py-2 text-sm leading-5 text-gray-700 w-full hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 text-left"
                                        {...option}
                                        onClick={() => {
                                            if (option.onClick) {
                                                option.onClick();
                                            }

                                            setIsActive(false);
                                        }}
                                    >
                                        {option.icon && (
                                            <Icon classes="h-4 mr-3 w-4" name={option.icon} />
                                        )}
                                        {option.label}
                                    </Link>
                                );
                            }
                        })}
                    </div>
                </div>
            </Transition>
        </div>
    );
};

export default Dropdown;
