import {object, ObjectSchema, string} from 'yup';

export interface LoginForm {
    email: string;
    password?: string;
}

const schema: ObjectSchema<LoginForm> = object().shape({
    email: string().email('empty').required('empty'),
    password: string().required('empty').min(8, 'empty')
});

const fields = {
    email: {
        errors: {
            empty: 'Please enter a valid email address',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/user-disabled': 'This account is not active. Please contact an admin.',
            'auth/user-not-found': 'Sorry, this account does not exist.'
        },
        field: 'input',
        label: 'Email address',
        placeholder: 'you@domain.com',
        type: 'email'
    },
    password: {
        errors: {
            'auth/wrong-password': 'Your credentials were wrong. Please try again.',
            empty: 'Please enter your password',
            maxLength: 'Please enter your password'
        },
        features: ['password'],
        field: 'input',
        label: 'Your password',
        placeholder: '',
        type: 'password'
    }
};

const loginSchema = {fields, schema};

export default loginSchema;
