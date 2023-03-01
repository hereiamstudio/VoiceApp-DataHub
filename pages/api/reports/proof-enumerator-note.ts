import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseDB as db} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import {deleteCachedReportData} from './';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const interviewId = req.query?.interviewId?.toString();
    const projectId = req.query?.projectId?.toString();
    const responseId = req.query?.responseId?.toString();
    const data = req.body;
    const session = await getServerSession(req, res, authOptions);

    // Delete the cached report, it will be regenerated after we update
    // the stored responses.
    await deleteCachedReportData(projectId, interviewId);

    try {
        const responseRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId)
            .collection('responses')
            .doc(responseId);
        const activitiesRef = db().collection('activities').doc();

        const batch = db().batch();
        const responseSnapshot = await responseRef.get();
        const responseData = responseSnapshot.data();

        // Save the response document
        batch.update(responseRef, {
            enumerator_notes: {
                ...responseData.enumerator_notes,
                text: data.proofed,
                original_text: responseData.enumerator_notes.text,
                is_proofed: true,
                proofed_at: new Date(), // db.FieldValue.serverTimestamp(),
                proofed_by: {
                    first_name: session.user.first_name,
                    last_name: session.user.last_name,
                    id: session.user.uid
                }
            }
        });

        // Save audit activity
        batch.create(activitiesRef, {
            action: ActivityAction.PROOF_OPEN_RESPONSE,
            info: {
                project_id: projectId,
                interview_id: interviewId,
                response_id: responseId
            },
            ip: getIp(req),
            type: ActivityType.RESPONSE,
            ...createdBy(session.user)
        });

        await batch.commit();

        res.status(200).json({success: true});
    } catch (error) {
        captureException(error);
        res.status(500).json({success: false, error: error.message});
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
