import React, {ReactNode} from 'react';

interface Props {
    children: ReactNode;
}

const EmptyPanel: React.FC<Props> = ({children}: Props) => (
    <div className="bg-gray-150 rounded-lg border-4 border-dashed border-gray-200 text-center font-sans text-base font-normal text-gray-700">
        <div className="direction-column align-center flex justify-center px-4 py-5 sm:p-6">
            {children}
        </div>
    </div>
);

export default EmptyPanel;
