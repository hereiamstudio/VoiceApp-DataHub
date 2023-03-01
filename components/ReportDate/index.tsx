import React, {useEffect, useRef, useState} from 'react';
import dayjs from 'dayjs';
import Icon from '@/components/Icon';

interface Props {
    endTime?: number;
    isReportActive?: boolean;
    startTime: number;
}

const ReportDate: React.FC<Props> = ({endTime, isReportActive, startTime}: Props) => {
    const $container = useRef(null);
    const [isDetailView, setIsDetailView] = useState(false);

    const dateFormat = isDetailView ? 'MMMM D YYYY, H:mma' : 'MMMM D YYYY';
    const endLabel = dayjs(endTime).format(dateFormat);
    const startLabel = dayjs(startTime).format(dateFormat);

    const handleMouseOut = () => setIsDetailView(false);
    const handleMouseOver = () => setIsDetailView(true);

    useEffect(() => {
        const node = $container.current;

        if (node) {
            node.addEventListener('mouseover', handleMouseOver);
            node.addEventListener('mouseout', handleMouseOut);

            return () => {
                node.removeEventListener('mouseover', handleMouseOver);
                node.removeEventListener('mouseout', handleMouseOut);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [$container.current]);

    return (
        <button
            className="mt-1 flex items-center text-sm font-medium text-gray-500 transition duration-200 hover:text-gray-700 focus:outline-none"
            ref={$container}
            type="button"
        >
            {startLabel} until {isReportActive ? 'now' : endLabel}
            <Icon name="info" classes="ml-2 w-5 h-5" />
        </button>
    );
};

export default ReportDate;
