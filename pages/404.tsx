import React from 'react';
import SEO from '@/components/SEO';
import WarningPage from '@/components/WarningPage';
import strings from '@/locales/en.json';

const NotFoundPage = () => (
    <>
        <SEO title={strings.generic.notFound.title} />
        <WarningPage
            title={strings.generic.notFound.title}
            text={strings.generic.notFound.text}
            ctaLabel={strings.generic.notFound.cta}
            ctaUrl="/"
        />
    </>
);

export default NotFoundPage;
