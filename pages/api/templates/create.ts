import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {firebaseDB as db, createdBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

export const TEMPLATE_PUBLIC_FIELDS = [
    'description',
    'is_archived',
    'question_title',
    'question_description',
    'type',
    'primary_language'
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const data = req.body;
        const templateData = {
            is_archived: false,
            ...data,
            ...createdBy(session.user)
        };

        // We'll be updated both the template document and the public document for the template
        // if it's a probing question, so we'll need to write these in a batch.
        const batch = db().batch();

        // Create a doc ID to use in the batch writes.
        const newTemplateRef = db().collection('templates').doc();

        // Save all the data for the template.
        const template = batch.set(newTemplateRef, templateData);

        // Only probing questions need to be duplicated for consumption by the App.
        if (templateData.type === 'probing_question') {
            // Create the document for the public version of the template.
            const newTemplatePublicRef = db()
                .collection('templates')
                .doc(newTemplateRef.id)
                .collection('templates_public')
                .doc(newTemplateRef.id);

            // Save only the limited data required for the App to the public doc.
            const templatePublic = batch.set(
                newTemplatePublicRef,
                pick(templateData, TEMPLATE_PUBLIC_FIELDS)
            );
        }

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.ADD_TEMPLATE,
                info: {template_id: newTemplateRef.id},
                ip: getIp(req),
                type: ActivityType.TEMPLATE,
                ...createdBy(session.user)
            });

        res.status(200).json({id: newTemplateRef.id});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_templates_create_error',
            message: strings.errors.firebase_templates_create_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
