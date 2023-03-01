import React, {ReactNode, Fragment} from 'react';
import dynamic from 'next/dynamic';

interface Props {
    children: ReactNode;
}

const ClientOnly: React.FC<Props> = ({children}: Props) => <Fragment>{children}</Fragment>;

export default dynamic(() => Promise.resolve(ClientOnly), {
    ssr: false
});
