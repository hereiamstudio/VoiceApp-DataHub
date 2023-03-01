import React, {ReactNode} from 'react';

interface Props {
    children: ReactNode;
    condition: any;
    fallbackWrapper?: (children: ReactNode) => ReactNode;
    wrapper?: (children: ReactNode) => ReactNode;
}

const ConditionalWrapper: React.FC<Props> = ({
    children,
    condition,
    fallbackWrapper,
    wrapper
}: Props) => {
    if (condition) {
        return <>{wrapper(children)}</>;
    } else if (fallbackWrapper) {
        return <>{fallbackWrapper(children)}</>;
    } else {
        return <>{children}</>;
    }
};

export default ConditionalWrapper;
