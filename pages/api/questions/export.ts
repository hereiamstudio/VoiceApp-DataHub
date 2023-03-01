import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import kebabCase from 'lodash/kebabCase';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import type {Question} from '@/types/question';
import {createdBy, firebaseDB as db} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import {documentHasTranslations, humanise} from '@/utils/helpers';
import createExport from './create-export';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const exportType = (req.query?.type?.toString() as 'csv' | 'excel') || 'excel';
        const language = req?.query?.language?.toString() || '';
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const title = req.query?.title?.toString();
        const questionsRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId)
            .collection('questions');

        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        const query = questionsRef.where('is_archived', '==', false);
        const snaphshot = await query.orderBy('order', 'asc').limit(limit).offset(offset).get();

        const data: Partial<Question>[] = snaphshot.docs.map(doc => {
            const docData = doc.data();
            const useTranslatedField = documentHasTranslations(language, docData);

            if (useTranslatedField) {
                return {
                    title: docData.translations[language].title,
                    description: docData.translations[language].description,
                    type: docData.type,
                    options: docData.translations[language].options
                };
            } else {
                return {
                    title: docData.title,
                    description: docData.description,
                    type: docData.type,
                    options: docData.options
                };
            }
        });

        if (data) {
            const exportFile = await createExport.getFile(exportType, data);

            res.setHeader(
                'Content-disposition',
                `attachment; filename=${createExport.getFilename(
                    `${kebabCase(title)}${language ? `-${language}` : ''}`,
                    exportType
                )}`
            );
            res.setHeader('Content-Type', 'text/csv;charset=utf-8');

            // Save audit activity
            await db()
                .collection('activities')
                .add({
                    action: ActivityAction.EXPORT_INTERVIEW_QUESTIONS,
                    info: {
                        export_type: exportType,
                        project_id: projectId,
                        interview_id: interviewId
                    },
                    ip: getIp(req),
                    type: ActivityType.QUESTION,
                    ...createdBy(session.user)
                });

            return res.status(200).send(exportFile);
        }

        res.status(200).json({error: 'empty'});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_questions_export_fetch_error',
            message: strings.errors.firebase_questions_export_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {bodyParser: false, externalResolver: true}};

export default withSentry(handler);
