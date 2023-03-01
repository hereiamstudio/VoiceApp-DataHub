import {object, ObjectSchema, ref, string} from 'yup';
import type {User} from '@/types/user';

const schema: ObjectSchema<Partial<User>> = object().shape({
    password: string().min(8, 'minLength').max(40, 'maxLength').required('empty'),
    confirm_password: string()
        .oneOf([ref('password'), null], 'error')
        .required('empty')
});

export default schema;
