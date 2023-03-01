import React, {useContext, useState} from 'react';
import useSWR from 'swr';
import ActivityIndicator from '@/components/ActivityIndicator';
import APIView from '@/components/APIView';
import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import strings from '@/locales/en.json';
import type {Template} from '@/types/template';
import {pluralise} from '@/utils/helpers';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

interface Props {
    handleCancel: Function;
    handleSelect: Function;
    language?: string;
    type: string;
}

const TemplateSelectionList: React.FC<Props> = ({
    handleCancel,
    handleSelect,
    language = '',
    type
}: Props) => {
    const {data: allTemplates, error} = useSWR(`/api/templates?type=${type}&language=${language}`);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleTemplateClick = (template: Template) => {
        if (handleSelect) {
            setSelectedTemplate(template.id);
            handleSelect(template);
        }

        setTimeout(() => {
            handleCancel();
            setSelectedTemplate(null);
        }, 500);
    };

    return (
        <>
            {language && (
                <div className="-mb-2 text-sm text-gray-500">
                    {allTemplates?.length} {pluralise(allTemplates?.length, 'template')} available
                    in {INTERVIEW_LANGUAGES[language]}
                </div>
            )}
            <ul
                className="my-5 list-inside text-sm text-gray-600"
                data-testid="questions-order-list"
            >
                <APIView
                    empty={strings.templatesSelector.empty}
                    error={error}
                    hasError={error}
                    isEmpty={allTemplates && !allTemplates?.length}
                    isLoading={!error && !allTemplates}
                    loadingText="Fetching templates"
                >
                    {allTemplates?.map(template => (
                        <li key={template.id}>
                            <button
                                className="mb-3 w-full overflow-hidden bg-white text-left shadow transition-all duration-200 hover:shadow-md sm:rounded-lg"
                                onClick={() => handleTemplateClick(template)}
                                type="button"
                            >
                                <div className="flex items-center border-b border-gray-200 px-4 py-4 sm:px-6">
                                    <div className="mr-4 flex-grow space-y-2">
                                        <strong className="inline-block text-base font-semibold">
                                            {template.data.title}
                                        </strong>
                                        {(template.data.usage || !language) && (
                                            <div className="space-x-3">
                                                {!language && (
                                                    <Badge theme="gray">
                                                        {
                                                            INTERVIEW_LANGUAGES[
                                                                template.data.primary_language
                                                            ]
                                                        }
                                                    </Badge>
                                                )}
                                                {template.data.usage && (
                                                    <span className="font-normal text-gray-500">
                                                        {strings.templatesSelector.usage}{' '}
                                                        {template.data.usage}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {selectedTemplate === template.id ? (
                                        <ActivityIndicator />
                                    ) : (
                                        <Icon name="chevron-right" classes="w-5 h-5" />
                                    )}
                                </div>
                            </button>
                        </li>
                    ))}
                </APIView>
            </ul>
        </>
    );
};

export default TemplateSelectionList;
