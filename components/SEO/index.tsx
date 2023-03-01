import React from 'react';
import {NextSeo} from 'next-seo';
import strings from '@/locales/en.json';

interface Props {
    title: string;
}

const SEO: React.FC<Props> = ({title}: Props) => <NextSeo title={`${title} | ${strings.name}`} />;

export default SEO;
