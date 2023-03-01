import {array, bool, object, ObjectSchema, string} from 'yup';
import type {Project} from '@/types/project';
import {COUNTRIES} from '@/utils/countries';

const details: ObjectSchema<Partial<Project>> = object().shape({
    title: string().min(5, 'empty').max(100, 'maxLength').required('empty'),
    description: string().min(5, 'empty').max(500, 'maxLength').required('empty'),
    location_country: string().oneOf(Object.keys(COUNTRIES), 'empty').required('empty'),
    location_region: string().min(3, 'empty').max(100, 'maxLength').required('empty'),
    is_active: bool().nullable()
});

const detailsFields = {
    title: {
        columns: 6,
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
        rows: 6
    },
    location_country: {
        columns: 6,
        errors: {empty: 'Please select a country'},
        field: 'select',
        label: 'Country',
        placeholder: 'Select a country'
    },
    location_region: {
        columns: 6,
        errors: {
            empty: 'Please enter a region',
            maxLength: 'Regions can only be 100 characters or less'
        },
        field: 'input',
        label: 'Region'
    },
    is_active: {
        columns: 6,
        field: 'input',
        description: 'Only published projects can be viewed on the App.',
        label: 'Publish on App',
        type: 'checkbox'
    }
};

const users: ObjectSchema<Partial<Project>> = object().shape({
    assigned_users: array().of(string())
});

const usersFields = {
    assigned_users: {
        field: 'input',
        type: 'hidden'
    }
};

export const detailsSchema = {fields: detailsFields, schema: details};
export const usersSchema = {fields: usersFields, schema: users};
