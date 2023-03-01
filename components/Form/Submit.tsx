import React, {useContext} from 'react';
import {useFormikContext} from 'formik';
import Button from '@/components/Button';
import {FormContext} from '@/components/Form';
import {RequestType} from '@/types/request';

interface Props {
    className?: string;
    label?: string;
}

const FormSubmit: React.FC<Props> = ({
    className = 'justify-center w-full',
    label = 'Submit'
}: Props) => {
    const {status} = useContext(FormContext);
    const {handleSubmit} = useFormikContext();

    return (
        <Button
            classes={className}
            disabled={status !== RequestType.DEFAULT}
            onClick={handleSubmit}
            state={status}
            type="submit"
        >
            {label}
        </Button>
    );
};

export default FormSubmit;
