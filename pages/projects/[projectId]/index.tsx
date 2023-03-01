import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import PageWrapper from '@/components/PageWrapper';

const ProjectsDetailPage: React.FC = () => {
    const router = useRouter();
    const {projectId} = router.query;

    useEffect(() => {
        router.replace(`/projects/${projectId}/interviews`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PageWrapper>
            <span />
        </PageWrapper>
    );
};

export default ProjectsDetailPage;
