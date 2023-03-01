import React, {memo} from 'react';

const QuestionManagementItemPlaceholder: React.FC = () => (
    <div className="bg-white bg-opacity-70 px-4 py-5 shadow sm:rounded-md sm:border sm:border-gray-100 sm:px-6">
        <div
            className="h-[24px] w-full animate-pulse rounded bg-gray-200"
            style={{width: `${50 + Math.random() * 50}%`}}
        />
    </div>
);

export default memo(QuestionManagementItemPlaceholder);
