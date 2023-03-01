import {array, bool, mixed, number, object, ObjectSchema, string} from 'yup';
import type {Question} from '@/types/question';
import {QUESTION_TYPES} from '@/utils/questions';

const question: ObjectSchema<Partial<Question>> = object().shape({
    title: string().min(5, 'empty').max(200, 'maxLength').required('empty'),
    description: string().max(500, 'maxLength').nullable(),
    type: string().oneOf(Object.keys(QUESTION_TYPES)).required('empty'),
    options: array().when('type', {
        is: value => !value || value === 'free_text',
        then: array().of(string()).nullable(),
        otherwise: array().of(string().required('empty')).required('empty')
    }),
    skip_logic: array().when('type', {
        is: value => value === 'free_text',
        then: array().of(string()).nullable(),
        otherwise: array()
            .of(
                object().shape({
                    action: string().required('empty'),
                    questionId: string().required('empty'),
                    type: string().oneOf(['exactly', 'all', 'any', 'none']).required('empty'),
                    values: array().of(string()).required('empty')
                })
            )
            .nullable()
    })
});

const questionFields = {
    is_active: {field: 'input', type: 'hidden', value: true},
    title: {
        columns: 12,
        errors: {
            empty: 'Please enter a title',
            maxLength: 'Titles can only be 200 characters or less'
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
        field: 'input',
        label: 'Description'
    },
    type: {
        columns: 7,
        errors: {empty: 'Please select a question type'},
        field: 'input',
        label: 'Type',
        type: 'radio'
    },
    options: {
        columns: 5,
        errors: {empty: 'Please add at least one option'},
        field: 'component',
        name: 'AddSelectOptions'
    },
    skip_logic: {
        columns: 12,
        errors: {empty: 'Please add at least one skip logic criteria'},
        field: 'component',
        name: 'AddSkipLogic'
    }
};

export const questionSchema = {fields: questionFields, schema: question};
