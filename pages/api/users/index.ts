import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import flatMap from 'lodash/flatMap';
import {getDateFromTimestamp} from '@/utils/helpers';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const usersRef = db().collection('users');
        const filters = {
            country: req?.query?.country?.toString(),
            is_archived: req?.query?.is_archived === 'true',
            project: req?.query?.project?.toString(),
            role: req?.query?.role
        };

        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        let query = usersRef.where('is_archived', '==', filters.is_archived);
        let interviewsUserIds;

        if (filters.country && filters.country !== 'any') {
            query = query.where('country', '==', filters.country);
        }

        // Although we filter by project, it's the interviews that are important
        // when filtering users against them as this is where questions and data
        // reside.
        // Interviews may also contain a large amount of users, but Firebase only
        // allows up to 10 comparison values so we cannot use 'array-contains' or
        // 'array-contains-any' as a filter against the user query. See:
        // https://cloud.google.com/firestore/docs/query-data/queries#in_not-in_and_array-contains-any

        if (filters.project && filters.project !== 'any') {
            const interviewsQuery = db()
                .collection('projects')
                .doc(filters.project)
                .collection('interviews')
                .orderBy('title', 'asc');
            const interviewsSnapshot = await interviewsQuery.get();

            interviewsUserIds = interviewsSnapshot.docs
                .map(doc => {
                    const docData = doc.data();

                    if (docData.assigned_users_ids.length) {
                        return docData.assigned_users_ids;
                    }
                })
                .filter(i => i);
            interviewsUserIds = flatMap(interviewsUserIds);
        }

        if (filters.role && filters.role !== 'any') {
            query = query.where('role', '==', filters.role);
        }

        let snapshot;

        // As a result of the project filter issue with user ids, we cannot use
        // standard pagination when querying users. Instead, we will query all
        // users, then do filtering here before returning an offset of the results
        // to mimic the query pagination. If no project filter is used, we can
        // paginate as normal.
        if (interviewsUserIds) {
            snapshot = await query.orderBy('first_name', 'asc').orderBy('last_name', 'asc').get();
        } else {
            snapshot = await query
                .orderBy('first_name', 'asc')
                .orderBy('last_name', 'asc')
                .limit(limit)
                .offset(offset)
                .get();
        }

        const data = snapshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                data: {
                    first_name: docData.first_name,
                    last_name: docData.last_name,
                    role: docData.role,
                    company_name: docData.company_name,
                    country: docData.country,
                    updated_at: getDateFromTimestamp(docData.updated_at || docData.created_at),
                    updated_by: docData.updated_by
                        ? docData.updated_by.first_name
                        : docData.created_by?.first_name
                }
            };
        });

        if (interviewsUserIds) {
            const filteredData = data.filter(i => interviewsUserIds.includes(i.id));
            const paginatedData = filteredData.filter(
                (_, index) => index >= offset && index <= offset + (limit - 1)
            );

            res.status(200).json(paginatedData);
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_all_fetch_error',
            message: strings.errors.firebase_users_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
