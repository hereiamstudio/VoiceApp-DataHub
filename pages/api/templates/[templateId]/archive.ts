import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseDB as db, updatedBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import {TEMPLATE_PUBLIC_FIELDS} from '../create';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const templateId = req.query?.templateId?.toString();
        const type = req.query?.type?.toString();
        const templateData = {
            is_archived: req.body.is_archived,
            ...updatedBy(session.user)
        };

        // We'll be updated both the template document and the public document for the template
        // if it's a probing question, so we'll need to write these in a batch.
        const batch = db().batch();
        const templateRef = db().collection('templates').doc(templateId);

        // Update all the data for the template.
        batch.update(templateRef, templateData);

        if (type === 'probing_question') {
            const templatePublicRef = db()
                .collection('templates')
                .doc(templateId)
                .collection('templates_public')
                .doc(templateId);

            // Update only the limited data require for the App to the public doc.
            batch.update(templatePublicRef, pick(templateData, TEMPLATE_PUBLIC_FIELDS));
        }

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: req.body.is_archived
                    ? ActivityAction.ARCHIVE_TEMPLATE
                    : ActivityAction.RESTORE_TEMPLATE,
                info: {
                    is_archived: req.body.is_archived,
                    template_id: templateId
                },
                ip: getIp(req),
                type: ActivityType.TEMPLATE,
                ...createdBy(session.user)
            });

        // Send back the merged data after it has been saved.
        res.status(200).json({id: templateId});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_templates_archive_error',
            message: strings.errors.firebase_templates_archive_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
