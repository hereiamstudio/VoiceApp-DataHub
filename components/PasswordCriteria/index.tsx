import React from 'react';
import map from 'lodash/map';
import Icon from '../Icon';
import {includesAlphaNumeric} from '../../utils/helpers';

type Props = {
    criteria: {
        [key: string]: any;
    };
    password: string;
};

const PasswordCriteria: React.FC<Props> = ({criteria, password = ''}: Props) => {
    const passedCriteria = {
        length: password.length >= 8,
        alphanumeric: includesAlphaNumeric(password)
    };

    return (
        <ul className="text-sm">
            {map(criteria, (label: string, key: string) => (
                <li
                    key={key}
                    className={`align-center flex ${
                        passedCriteria[key] ? 'text-green-500' : 'text-gray-500'
                    }`}
                    data-testid="criteria"
                    data-valid={passedCriteria[key]}
                >
                    {passedCriteria[key] ? (
                        <Icon classes="flex-shrink-0 h-5 w-5 mr-2 text-green-500" name="check" />
                    ) : (
                        <Icon classes="flex-shrink-0 h-5 w-5 mr-2 text-gray-500" name="cross" />
                    )}
                    {label}
                </li>
            ))}
        </ul>
    );
};

export default PasswordCriteria;
