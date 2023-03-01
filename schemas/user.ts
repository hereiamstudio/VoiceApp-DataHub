import {boolean, object, ObjectSchema, string} from 'yup';
import type {Password, User} from '@/types/user';
import {COUNTRIES} from '@/utils/countries';
import {ROLES} from '@/utils/roles';
import {includesAlphaNumeric} from '@/utils/helpers';

const role: ObjectSchema<Pick<User, 'is_available_for_projects' | 'role'>> = object().shape({
    role: string().oneOf(Object.keys(ROLES), 'empty').required('empty'),
    is_available_for_projects: boolean().required('empty')
});

const roleFields = {
    role: {
        columns: 6,
        errors: {empty: 'Please select a role'},
        field: 'select',
        label: 'Role'
    },
    role_info: {columns: 6, field: 'component', name: 'RoleInfo'},
    is_available_for_projects: {
        columns: 12,
        description: 'Enable this so that this user can be assigned to projects and/or interviews.',
        field: 'input',
        label: 'Can be assigned to projects',
        type: 'checkbox'
    }
};

const password: ObjectSchema<Pick<Password, 'password'>> = object().shape({
    password: string()
        .test('alphanumeric', 'alphanumeric', v => v && includesAlphaNumeric(v))
        .min(8, 'minLength')
        .max(40, 'maxLength')
        .required('empty')
});

const passwordFields = {
    password: {
        columns: 6,
        errors: {
            empty: 'Please create a password',
            minLength: 'The password must be 8 characters or more',
            maxLength: 'The password must be less than 40 characters',
            alphanumeric: 'The password must contain a mix of uppercase, lowercase and numbers'
        },
        field: 'input',
        label: 'Password',
        type: 'password'
    },
    password_criteria: {columns: 6, field: 'component', name: 'PasswordCriteria'}
};

const profile: ObjectSchema<
    Pick<User, 'company_name' | 'country' | 'email' | 'first_name' | 'last_name'>
> = object().shape({
    first_name: string().max(50, 'maxLength').required('empty'),
    last_name: string().max(100, 'maxLength').required('empty'),
    email: string().email('invalid').required('empty'),
    company_name: string().required('empty'),
    country: string().oneOf(Object.keys(COUNTRIES), 'empty').required('empty')
});

const profileFields = {
    first_name: {
        columns: 6,
        errors: {empty: 'Please enter a first name'},
        field: 'input',
        label: 'First name'
    },
    last_name: {
        columns: 6,
        errors: {empty: 'Please enter a last name'},
        field: 'input',
        label: 'Last name'
    },
    email: {
        columns: 6,
        errors: {
            empty: 'Please enter an email address',
            invalid: 'Please enter a valid email address'
        },
        field: 'input',
        label: 'Email',
        type: 'email'
    },
    company_name: {
        columns: 6,
        errors: {empty: 'Please enter a company name'},
        field: 'input',
        label: 'Company name'
    },
    country: {
        columns: 6,
        errors: {empty: 'Please select a country'},
        field: 'select',
        label: 'Country',
        placeholder: 'Select a country'
    }
};

const create = profile.concat(role);

export const roleSchema = {fields: roleFields, schema: role};
export const passwordSchema = {fields: passwordFields, schema: password};
export const profileSchema = {fields: profileFields, schema: profile};
export const createSchema = {
    fields: {
        ...profileFields,
        divider: {columns: 12, field: 'component', name: 'Divider'},
        ...roleFields
    },
    schema: create
};
