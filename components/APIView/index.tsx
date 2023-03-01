import React, {ReactNode} from 'react';
import ActivityIndicator from '@/components/ActivityIndicator';
import EmptyPanel from '@/components/EmptyPanel';
import strings from '@/locales/en.json';
import {getMessageFromError} from '@/utils/helpers';

interface Props {
    children: ReactNode;
    empty?: string | ReactNode;
    error?: string | ReactNode;
    hasError: boolean;
    isEmpty?: boolean;
    isLoading?: boolean;
    loading?: string | ReactNode;
    loadingText?: string;
}

const APIView: React.FC<Props> = ({
    children,
    empty,
    error,
    hasError,
    isEmpty,
    isLoading,
    loading,
    loadingText
}: Props) => {
    if (isLoading) {
        return (
            <EmptyPanel>
                {loading ? loading : <ActivityIndicator />}
                {loadingText && (
                    <span className="ml-4 text-sm font-medium text-gray-500">{loadingText}</span>
                )}
            </EmptyPanel>
        );
    } else if (hasError) {
        return (
            <EmptyPanel>
                <svg
                    className="mr-2 h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <span className="text-red-600">
                    {getMessageFromError(error, strings.generic.apiError)}
                </span>
            </EmptyPanel>
        );
    } else if (isEmpty) {
        return <EmptyPanel>{empty}</EmptyPanel>;
    } else {
        return <div className="animate-fade-in">{children}</div>;
    }
};

export default APIView;
