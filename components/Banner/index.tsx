import React, {useState} from 'react';
import Icon from '@/components/Icon';
import Link from '@/components/Link';
import type {CTA} from '@/types/index';

interface Props {
    cta?: CTA;
    text: string;
}

const Banner: React.FC<Props> = ({cta, text}: Props) => {
    const [hasDismissed, setHasDismissed] = useState(false);

    const handleDismiss = () => setHasDismissed(!hasDismissed);

    if (hasDismissed) {
        return null;
    }

    return (
        <div className="relative bg-pink-600">
            <div className="mx-auto max-w-screen-xl py-3 px-3 sm:px-6 lg:px-8">
                <div className="pr-16 sm:px-16 sm:text-center">
                    <p className="font-medium text-white">
                        {text}
                        {cta && (
                            <span className="block sm:ml-2 sm:inline-block">
                                <Link url={cta.url} className="font-bold text-white underline">
                                    {cta.label} &rarr;
                                </Link>
                            </span>
                        )}
                    </p>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-start pt-1 pr-1 sm:items-start sm:pt-1 sm:pr-2">
                    <button
                        type="button"
                        className="flex rounded-md p-2 transition duration-150 ease-in-out hover:bg-pink-500 focus:bg-pink-500 focus:outline-none"
                        aria-label="Dismiss"
                        data-testid="dismiss"
                        onClick={handleDismiss}
                    >
                        <Icon classes="h-6 w-6 text-white" name="cross" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Banner;
