import React from 'react';
import {getFieldStyles} from '@/components/FormField';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import strings from '@/locales/en.json';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

interface Props {
    defaultLanguage: string;
    onChange: Function;
    languages: string[];
    selectedLanguage: string;
}

const LanguageSelector: React.FC<Props> = ({
    defaultLanguage,
    onChange,
    languages,
    selectedLanguage
}: Props) => (
    <div>
        <div className="flex items-center space-x-1">
            <label
                htmlFor="language"
                className="block font-medium leading-5 text-gray-700 sm:text-sm"
            >
                {strings.generic.chooseLanguage}
            </label>
            <Tooltip text={strings.generic.automatedTranslationTip}>
                <Icon name="info" classes="w-5 h-5" />
            </Tooltip>
        </div>
        <select
            id="language"
            className={`${getFieldStyles(
                false
            )} form-select mt-1 block w-full max-w-[260px] rounded-md border px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none sm:text-sm sm:leading-5`}
            onChange={event => onChange(event.target.value)}
            value={selectedLanguage}
        >
            {languages.map(language => (
                <option key={language} value={language}>
                    {INTERVIEW_LANGUAGES[language]}
                    {language !== defaultLanguage && ` (${strings.generic.automatedTranslation})`}
                </option>
            ))}
        </select>
    </div>
);

export default LanguageSelector;
