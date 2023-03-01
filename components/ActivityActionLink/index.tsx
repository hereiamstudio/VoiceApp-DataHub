import React from 'react';
import Link from '@/components/Link';
import {ActivityAction, ActivityType, Activity} from '@/types/activity';

interface Props {
    activity: Activity;
}

const ActivityActionLink: React.FC<Props> = ({activity}: Props) => {
    if (activity.type === ActivityType.EXPORT) {
        if (activity.action === ActivityAction.EXPORT_PROJECT_INTERVIEWS_REPORT) {
            return (
                <Link
                    className="hover:underline"
                    url={`/projects/${activity.info.project_id}/update`}
                >
                    {activity.action}
                </Link>
            );
        } else {
            return (
                <Link
                    className="hover:underline"
                    url={`/projects/${activity.info.project_id}/interviews/${activity.info.interview_ids[0]}/reports`}
                >
                    {activity.action}
                </Link>
            );
        }
    } else if (activity.type === ActivityType.INTERVIEW) {
        return (
            <Link
                className="hover:underline"
                url={`/projects/${activity.info.project_id}/interviews/${activity.info.interview_id}/update`}
            >
                {activity.action}
            </Link>
        );
    } else if (activity.type === ActivityType.PROJECT) {
        return (
            <Link className="hover:underline" url={`/projects/${activity.info.project_id}/update`}>
                {activity.action}
            </Link>
        );
    } else if (activity.type === ActivityType.QUESTION) {
        return (
            <Link
                className="hover:underline"
                url={`/projects/${activity.info.project_id}/interviews/${activity.info.interview_id}/questions/${activity.info.question_id}/update`}
            >
                {activity.action}
            </Link>
        );
    } else if (activity.type === ActivityType.RESPONSE) {
        return (
            <Link
                className="hover:underline"
                url={`/projects/${activity.info.project_id}/interviews/${activity.info.interview_id}/reports`}
            >
                {activity.action}
            </Link>
        );
    } else if (activity.type === ActivityType.TEMPLATE) {
        return (
            <Link
                className="hover:underline"
                url={`/templates/${activity.info.template_id}/update`}
            >
                {activity.action}
            </Link>
        );
    } else if (activity.type === ActivityType.USER) {
        return (
            <Link className="hover:underline" url={`/users/${activity.info.user_id}/update`}>
                {activity.action}
            </Link>
        );
    } else {
        return <>{activity.action}</>;
    }
};

export default ActivityActionLink;
