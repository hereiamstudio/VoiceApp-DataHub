import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';
import {COUNTRIES} from '@/utils/countries';

// This is a trade-off between creating a new store that tracks users and their project/interview
// ids and the countries used. Firestore's lack of "uniqueness" requires this. However, as the
// usage is low, right now the best approach would be just to "select all" and filter from here.
// If demand for this API grows we would then want to manage a new store to improve read times.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const projectsRef = db().collection('projects');
        const usersRef = db().collection('users');

        const projectsSnaphshot = await projectsRef.orderBy('title', 'asc').get();
        const projectAndUsersFilters = projectsSnaphshot.docs
            .map(doc => {
                const docData = doc.data();

                if (docData.assigned_users_ids.length > 0) {
                    return {
                        label: docData.title,
                        value: doc.id
                    };
                }
            })
            .filter(i => i);

        const usersSnaphshot = await usersRef.orderBy('country', 'asc').get();
        const countries = usersSnaphshot.docs.map(doc => {
            const docData = doc.data();

            return docData.country;
        });
        const countriesFilters = Array.from(new Set(countries)).map(country => ({
            label: COUNTRIES[country],
            theme: 'pink',
            value: country
        }));

        res.status(200).json({
            projects: [{label: 'Any', value: 'any'}, ...projectAndUsersFilters],
            countries: [{label: 'Any', value: 'any'}, ...countriesFilters]
        });
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_filter_options_fetch_error',
            message: strings.errors.firebase_users_filter_options_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
