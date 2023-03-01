import {array, bool, mixed, object, ObjectSchema, string} from 'yup';
import type {Interview, InterviewConsent} from '@/types/interview';
import {INTERVIEW_LANGUAGES, INTERVIEW_LOCALES, INTERVIEW_STATUSES} from '@/utils/interviews';

const details: ObjectSchema<Partial<Interview>> = object().shape({
    title: string().min(5, 'empty').max(150, 'maxLength').required('empty'),
    description: string().min(5, 'empty').max(500, 'maxLength').nullable(),
    primary_language: mixed().oneOf(Object.keys(INTERVIEW_LANGUAGES)).required('empty'),
    locale: mixed()
        .oneOf(INTERVIEW_LOCALES.map(({value}) => value))
        .required('empty'),
    status: mixed().oneOf(Object.keys(INTERVIEW_STATUSES)),
    is_active: bool().nullable()
});

const detailsFields = {
    primary_language: {
        columns: 6,
        errors: {empty: 'Please select the primary language'},
        field: 'select',
        label: 'Interview language'
    },
    locale: {
        columns: 6,
        errors: {empty: 'Please select the locale'},
        field: 'select',
        label: 'Interview locale'
    },
    localeOfflineSupport: {
        columns: 12,
        field: 'component',
        name: 'LocaleOfflineSupport'
    },
    title: {
        columns: 12,
        errors: {
            empty: 'Please enter a title',
            maxLength: 'Titles can only be 100 characters or less'
        },
        field: 'input',
        label: 'Title'
    },
    description: {
        columns: 12,
        errors: {
            empty: 'Please enter a description',
            maxLength: 'Descriptions can only be 500 characters or less'
        },
        field: 'textarea',
        label: 'Description',
        rows: 3
    },
    status: {
        columns: 6,
        errors: {empty: 'Please select the status'},
        field: 'input',
        label: 'Status',
        type: 'radio'
    },
    interview_status: {
        columns: 6,
        field: 'component',
        name: 'InterviewStatus'
    },
    is_active: {
        field: 'input',
        description: 'Only published interviews can be viewed on the App.',
        label: 'Publish on App',
        type: 'checkbox',
        value: true
    }
};

interface InterviewConsentType extends Partial<Omit<InterviewConsent, 'confirmation_options'>> {
    confirmation_options: string[];
}

const consent: ObjectSchema<InterviewConsentType> = object().shape({
    title: string().min(5, 'empty').max(100, 'maxLength').required('empty'),
    description: string().max(100, 'maxLength').nullable(),
    script: string().min(5, 'empty').max(5000, 'maxLength').required('empty'),
    confirmation_question: string().min(5, 'empty').max(100, 'maxLength').required('empty'),
    confirmation_options: array()
        .of(string().min(2, 'empty').max(100, 'maxLength'))
        .min(3, 'minLength')
        .required('empty')
});

const consentFields = {
    title: {
        columns: 8,
        errors: {
            empty: 'Please enter a title',
            maxLength: 'Titles can only be 150 characters or less'
        },
        field: 'input',
        label: 'Title'
    },
    description: {
        columns: 12,
        description: 'This describes the purpose of why consent is being asked for.',
        errors: {
            empty: 'Please enter a purpose for the consent',
            maxLength: 'The purpose text can only be 500 characters or less'
        },
        field: 'input',
        label: 'Purpose of consent'
    },
    script: {
        columns: 12,
        description: 'This is the consent script the enumerator will read to the respondent',
        errors: {
            empty: 'Please enter the consent script',
            maxLength: 'Scripts can only be 1,500 characters or less'
        },
        field: 'textarea',
        label: 'Consent script',
        rows: 8
    },
    confirmation_question: {
        columns: 12,
        errors: {
            empty: 'Please enter the confirmation question',
            maxLength: 'Questions can only be 150 characters or less'
        },
        field: 'input',
        label: 'Confirmation question'
    },
    confirmation_options: {
        columns: 12,
        description:
            'This is the correct option that the user must select to confirm they understand consent.',
        errors: {
            empty: 'Please enter a value for the confirmation option',
            maxLength: 'Consent option must be 100 characters or less'
        },
        label: 'Confirmation options',
        field: 'input',
        size: 3
    }
};

const users: ObjectSchema<Partial<Interview>> = object().shape({
    assigned_users: array().of(string())
});

export const detailsSchema = {fields: detailsFields, schema: details};
export const consentSchema = {fields: consentFields, schema: consent};
export const usersSchema = {fields: {}, schema: users};
