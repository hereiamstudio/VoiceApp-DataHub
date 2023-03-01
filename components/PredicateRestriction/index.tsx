import React, {ReactNode, useEffect, useState} from 'react';

interface Props {
    children: ReactNode;
    data: any;
    predicate: string;
}

const predicates = {
    isInternal: (email: string = '') => {
        return email.includes(process.env.INTERNAL_EMAIL_DOMAIN);
    }
};

const PredicateRestriction: React.FC<Props> = ({children, data, predicate}: Props) => {
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        if (predicate && data) {
            setIsAllowed(predicates[predicate](data));
        }
    }, [predicate, data]);

    if (isAllowed) {
        /**
         * See why we use this return format here:
         * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/44572
         */
        return children as unknown as JSX.Element;
    }

    return null;
};

export default PredicateRestriction;
