import React from 'react';
import Icon from '@/components/Icon';

const ActivityIndicator: React.FC = () => (
    <svg viewBox="0 0 50 50" className="spinner" data-testid="activity-indicator">
        <circle
            className="spinner-path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
        ></circle>
    </svg>
);

export default ActivityIndicator;
