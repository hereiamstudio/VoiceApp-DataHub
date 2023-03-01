import {array, mixed, object, ObjectSchema, string} from 'yup';
import type {ConsentTemplate, QuestionTemplate} from '@/types/template';
import {QUESTION_TYPES} from '@/utils/questions';
import {TEMPLATE_TYPES} from '@/utils/templates';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

interface ConsentTemplateType extends Partial<Omit<ConsentTemplate, 'type'>> {
    type: string;
}

const consent: ObjectSchema<ConsentTemplateType> = object().shape({
    primary_language: mixed().oneOf(Object.keys(INTERVIEW_LANGUAGES)),
    title: string().min(5, 'empty').max(100, 'maxLength').required('empty'),
    usage: string().max(100, 'maxLength').nullable(),
    script: string().min(5, 'empty').max(5000, 'maxLength').required('empty'),
    confirmation_question: string().min(5, 'empty').max(100, 'maxLength').required('empty'),
    confirmation_options: array()
        .of(string().min(2, 'empty').max(100, 'maxLength'))
        .min(3, 'minLength')
        .required('empty'),
    type: string().oneOf(Object.keys(TEMPLATE_TYPES), 'empty').required('empty')
});

const consentFields = {
    type: {
        field: 'input',
        type: 'hidden',
        value: 'consent'
    },
    primary_language: {
        columns: 8,
        description:
            'Templates will only be available for interviews that use the same primary language.',
        errors: {empty: 'Please select the primary language'},
        field: 'select',
        label: 'Primary language'
    },
    title: {
        columns: 8,
        description: 'The title is only used as a reference to the template',
        errors: {
            empty: 'Please enter a title',
            maxLength: 'Titles can only be 150 characters or less'
        },
        field: 'input',
        label: 'Title'
    },
    usage: {
        columns: 12,
        description: 'Providing a usage example will provide context when selecting templates',
        errors: {
            empty: 'Please enter a purpose for the consent',
            maxLength: 'The purpose text can only be 500 characters or less'
        },
        field: 'input',
        label: 'Usage example'
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

interface QuestionTemplateType extends Partial<Omit<QuestionTemplate, 'question_type' | 'type'>> {
    question_type: string;
    type: string;
}

const probingQuestion: ObjectSchema<Partial<QuestionTemplateType>> = object().shape({
    primary_language: mixed().oneOf(Object.keys(INTERVIEW_LANGUAGES)),
    question_description: string().min(5, 'empty').max(500, 'maxLength').nullable(),
    question_title: string().min(5, 'empty').max(200, 'maxLength').required('empty'),
    question_type: string().oneOf(Object.keys(QUESTION_TYPES)).required('empty'),
    title: string().min(5, 'empty').max(100, 'maxLength').required('empty'),
    usage: string().max(100, 'maxLength').nullable()
});

const probingQuestionFields = {
    type: {
        field: 'input',
        type: 'hidden',
        value: 'probing_question'
    },
    primary_language: {
        columns: 8,
        description:
            'Templates will only be available for interviews that use the same primary language.',
        errors: {empty: 'Please select the primary language'},
        field: 'select',
        label: 'Primary language'
    },
    title: {
        columns: 8,
        description: 'The title is only used as a reference to the template',
        errors: {
            empty: 'Please enter a title',
            maxLength: 'Titles can only be 150 characters or less'
        },
        field: 'input',
        label: 'Title'
    },
    usage: {
        columns: 12,
        description: 'Providing a usage example will provide context when selecting templates',
        errors: {
            empty: 'Please enter a purpose for the consent',
            maxLength: 'The purpose text can only be 500 characters or less'
        },
        field: 'input',
        label: 'Usage example'
    },
    question_title: {
        columns: 12,
        errors: {
            empty: 'Please enter a question title',
            maxLength: 'Question titles can only be 200 characters or less'
        },
        field: 'input',
        label: 'Question title'
    },
    question_description: {
        columns: 12,
        description: 'This is used to give context to the question when viewed in the App',
        errors: {
            empty: 'Please enter a description',
            maxLength: 'Descriptions can only be 500 characters or less'
        },
        field: 'input',
        label: 'Question description'
    }
};

const _question: ObjectSchema<Partial<QuestionTemplateType>> = object().shape({
    question_type: string().oneOf(Object.keys(TEMPLATE_TYPES), 'empty').required('empty'),
    question_options: array().when('question_type', {
        is: value => value === 'free_text',
        then: array().of(string()).nullable(),
        otherwise: array().of(string().required('empty')).required('empty')
    })
});
const question = probingQuestion.concat(_question);

const questionFields = {
    ...probingQuestionFields,
    question_type: {
        columns: 6,
        errors: {empty: 'Please select a question type'},
        field: 'select',
        label: 'Question type'
    },
    question_options: {
        columns: 6,
        errors: {empty: 'Please add at least one option'},
        field: 'component',
        name: 'AddSelectOptions'
    }
};

export const consentSchema = {fields: consentFields, schema: consent};
export const probingQuestionSchema = {fields: probingQuestionFields, schema: probingQuestion};
export const questionSchema = {fields: questionFields, schema: question};
