import React, {ReactNode} from 'react';

export interface Props {
    children: ReactNode;
    direction?: 'horizontal' | 'vertical';
    size?: number;
}

const Stack: React.FC<Props> = ({children, direction = 'vertical', size = 4}: Props) => (
    <div className={direction === 'vertical' ? 'space-y-4' : 'space-x-4'}>{children}</div>
);

export default Stack;
