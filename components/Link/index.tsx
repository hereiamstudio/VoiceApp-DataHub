import React from 'react';
import Link from 'next/link';
import omit from 'lodash/omit';
import type {CTA} from '@/types/index';

const LinkWrapper: React.FC<CTA> = ({as, classes, url = '', children, ...props}: CTA) => {
    if (url.includes('http') || url.includes('mailto:') || url.includes('tel:')) {
        return (
            <a href={url} target="noopener" className={classes} {...props}>
                {children}
            </a>
        );
    } else if (url) {
        return (
            <Link href={url} passHref>
                <a className={classes} {...props}>
                    {children}
                </a>
            </Link>
        );
    } else {
        const buttonProps = omit(props, ['url']);

        return (
            <button type="button" className={classes} {...buttonProps}>
                {children}
            </button>
        );
    }
};

export default LinkWrapper;
