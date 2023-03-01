import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import PageWrapper from '@/components/PageWrapper';

const InterviewsDetailPage: React.FC = () => {
    const router = useRouter();
    const {projectId, interviewId} = router.query;

    useEffect(() => {
        if (projectId && interviewId) {
            router.replace(`/projects/${projectId}/interviews/${interviewId}/overview`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, interviewId]);

    return (
        <PageWrapper>
            <span />
        </PageWrapper>
    );
};

export default InterviewsDetailPage;
