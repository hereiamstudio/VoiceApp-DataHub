import React from 'react';

interface Props {
    hideAtMobile?: boolean;
    paddingVertical?: string;
}

const PADDING = {
    none: '',
    xs: 'py-1',
    sm: 'py-2 py-3',
    md: 'py-4 sm:py-8'
};

const Divider: React.FC<Props> = ({hideAtMobile, paddingVertical = 'md'}: Props) => (
    <div className={PADDING[paddingVertical]} data-testid="divider">
        <div className={`border-t border-gray-200 ${hideAtMobile ? 'hidden sm:block' : ''}`}></div>
    </div>
);

export default Divider;
