import React, {ComponentType, Fragment, ReactNode} from 'react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Link from '@/components/Link';
import type {CTA} from '@/types/index';

interface Props {
    breadcrumbNav?: CTA[];
    children?: ReactNode;
    CustomPrimaryCta?: ComponentType;
    CustomSecondaryCta?: ComponentType;
    language?: string;
    primaryCta?: CTA;
    secondaryCta?: CTA;
    subtitle?: string;
    title: string;
}

const PageHeader: React.FC<Props> = ({
    breadcrumbNav = [],
    children,
    CustomPrimaryCta,
    CustomSecondaryCta,
    language,
    primaryCta,
    secondaryCta,
    subtitle,
    title
}: Props) => {
    const lastLink = breadcrumbNav.length > 1 ? breadcrumbNav[breadcrumbNav.length - 2] : null;

    return (
        <div className="md:pt-2">
            {breadcrumbNav.length > 0 && (
                <>
                    {lastLink && (
                        <nav data-testid="breadcrumb-nav-back" className="sm:hidden">
                            <Link
                                url={lastLink.url}
                                className="flex items-center text-sm font-medium leading-5 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700"
                            >
                                <Icon
                                    classes="flex-shrink-0 -ml-1 mr-1 h-5 w-5 text-gray-400"
                                    name="chevron-left"
                                />
                                {lastLink.label}
                            </Link>
                        </nav>
                    )}
                    <nav
                        data-testid="breadcrumb-nav-links"
                        className="hidden items-center text-sm font-medium leading-5 sm:flex"
                    >
                        {breadcrumbNav.map((link, index) => (
                            <Fragment key={`${link.label}-${link.url}`}>
                                {index < breadcrumbNav.length - 1 ? (
                                    <Link
                                        url={link.url}
                                        className="inline-block max-w-sm truncate break-words text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 md:break-all xl:break-normal"
                                    >
                                        {link.label}
                                    </Link>
                                ) : (
                                    <span className="inline-block max-w-sm truncate break-words text-gray-400 md:break-all xl:break-normal">
                                        {link.label}
                                    </span>
                                )}
                                {index < breadcrumbNav.length - 1 && (
                                    <Icon
                                        classes="flex-shrink-0 mx-2 h-5 w-5 text-gray-400"
                                        name="chevron-right"
                                    />
                                )}
                            </Fragment>
                        ))}
                    </nav>
                </>
            )}
            <div className="mt-2 mb-3 pb-4 md:mb-6 md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="flex items-center space-x-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:leading-9">
                        <span>{title}</span>
                        {language && <Badge theme="yellow">{language.toUpperCase()}</Badge>}
                    </h2>
                    {subtitle && (
                        <h3 className="text-md font-medium leading-7 text-pink-500 sm:truncate sm:leading-9">
                            {subtitle}
                        </h3>
                    )}
                    {children}
                </div>
                {(CustomPrimaryCta || CustomSecondaryCta || primaryCta || secondaryCta) && (
                    <div className="mt-4 flex flex-shrink-0 space-x-3 md:mt-0 md:ml-4">
                        {secondaryCta && (
                            <span className="rounded-md shadow-sm">
                                <Button
                                    url={secondaryCta.url}
                                    onClick={() => {
                                        if (secondaryCta.onClick) {
                                            secondaryCta.onClick();
                                        }
                                    }}
                                    theme="white"
                                    {...secondaryCta}
                                >
                                    {secondaryCta.label}
                                </Button>
                            </span>
                        )}
                        {CustomSecondaryCta && (
                            <span className="rounded-md shadow-sm">
                                <CustomSecondaryCta />
                            </span>
                        )}
                        {CustomPrimaryCta && (
                            <span className="rounded-md shadow-sm">
                                <CustomPrimaryCta />
                            </span>
                        )}
                        {primaryCta && (
                            <span className="rounded-md shadow-sm">
                                <Button
                                    url={primaryCta.url}
                                    onClick={() => {
                                        if (primaryCta.onClick) {
                                            primaryCta.onClick();
                                        }
                                    }}
                                    {...primaryCta}
                                >
                                    {primaryCta.label}
                                </Button>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
