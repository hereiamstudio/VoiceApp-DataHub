import React, {useEffect} from 'react';
import {useFormikContext} from 'formik';

interface Props {
    handleChange: (value: any) => void;
}

const FormListener: React.FC<Props> = ({handleChange}: Props) => {
    const {values} = useFormikContext();

    useEffect(() => {
        if (handleChange) {
            handleChange(values);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);

    return null;
};

export default FormListener;
