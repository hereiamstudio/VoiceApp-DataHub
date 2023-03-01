import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db, firebaseStorage as storage} from '@/utils/firebase/admin';
import createReportData from './create-report';

export const deleteCachedReportData = async (projectId, interviewId) => {
    const bucket = storage().bucket(`gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}`);

    await bucket.deleteFiles({
        prefix: `reports/${projectId}/${interviewId}/`
    });
    await bucket.deleteFiles({
        prefix: `exports/${projectId}/${interviewId}/`
    });
};

export const saveCachedReportData = async (data, projectId, interviewId, language = 'data') => {
    const bucket = storage().bucket(`gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}`);
    const file = bucket.file(`reports/${projectId}/${interviewId}/${language}.json`);
    const save = await file.save(JSON.stringify(data), {
        gzip: true,
        predefinedAcl: 'authenticatedRead'
    });

    return save;
};

export const hasCachedReport = async (projectId, interviewId, language = 'data') => {
    const bucket = storage().bucket(`gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}`);
    const file = bucket.file(`reports/${projectId}/${interviewId}/${language}.json`);
    const fileExists = await file.exists();

    // Not sure why but this is returned as an array...
    return fileExists[0];
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const language = req.query?.language?.toString();
        const hasCachedReportData = await hasCachedReport(projectId, interviewId, language);

        if (hasCachedReportData) {
            // Some reports exceed Vercel's API response limit. Instead of returning the data
            // we need to redirect to a Firebase Function that will return the data instead.
            return res.redirect(
                `${
                    process.env.NEXT_PUBLIC_REPORT_EXPORT_API_URL
                }/reports-returnCachedReportData?projectId=${projectId}&interviewId=${interviewId}&key=${
                    process.env.NEXT_PUBLIC_FIREBASE_ADMIN_API_KEY
                }${language ? `&language=${language}` : ''}`
            );
        }

        // If no report has been saved, we need to gather all the data required and then create
        // our report and then save it.
        const interviewRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId);
        const questionsRef = interviewRef.collection('questions').where('is_archived', '==', false);
        const responsesRef = interviewRef.collection('responses').orderBy('created_at', 'asc');

        const reportData = await db().runTransaction(async transaction => {
            const interview = await transaction.get(interviewRef);
            const responses = await transaction.get(responsesRef);
            const responsesData = responses.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (responsesData.length) {
                const responseQuestionsRef = await questionsRef.where(
                    'interview.id',
                    '==',
                    interviewId
                );
                const questions = await transaction.get(responseQuestionsRef);
                const questionsData = questions.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                return {
                    primary_language: interview.data().primary_language,
                    questions: questionsData,
                    responses: responsesData
                };
            }
        });

        // If we got our report data back, we can generate and store the report and export.
        if (reportData) {
            const {primary_language, questions, responses} = reportData;
            const report = createReportData(
                // @ts-ignore
                responses,
                questions,
                primary_language,
                language ? language : 'en'
            );

            try {
                // Save our new report so we don't have to calculate on the fly every time...
                saveCachedReportData(report, projectId, interviewId, language);
            } catch (error) {
                captureException(error);
                console.log(error);
            }

            return res.status(200).json(report);
        }

        res.status(200).json({error: 'empty'});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_reports_all_fetch_error',
            message: strings.errors.firebase_reports_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default handler;
