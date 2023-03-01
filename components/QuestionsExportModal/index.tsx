import React, {useContext, useState} from 'react';
import Form from '@/components/Form';
import LanguageSelector from '@/components/LanguageSelector';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import strings from '@/locales/en.json';
import {exportSchema} from '@/schemas/dataExport';
import {ModalVisibility} from '@/types/index';
import {RequestType} from '@/types/request';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

interface Props {
    defaultLanguage;
    interviewId: string;
    languages: string[];
    projectId: string;
    title: string;
}

const QuestionsExportModal: React.FC<Props> = ({
    defaultLanguage,
    interviewId,
    languages,
    projectId,
    title
}: Props) => {
    const {hideModal, modalKey, visibility} = useContext(ModalContext);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
    const [downloadStatus, setDownloadStatus] = useState(RequestType.DEFAULT);

    const getFields = () => {
        // If this interview does not have multiple languages then we need to hide the
        // language selector
        return {
            ...exportSchema.fields,
            ...(languages?.length > 1
                ? {language: exportSchema.fields.language}
                : {
                      language: {field: 'input', type: 'hidden', value: defaultLanguage},
                      languageSelector: null
                  })
        };
    };

    const handleFormSubmit = values => {
        const downloadUrl = `/api/questions/export?title=${title}&projectId=${projectId}&interviewId=${interviewId}&type=${values.type}&language=${values.language}`;

        setDownloadStatus(RequestType.PENDING);
        setTimeout(() => setDownloadStatus(RequestType.DEFAULT), 1500);
        window.location.href = downloadUrl;
        setTimeout(() => hideModal(), 500);
    };

    return (
        <Form.Container
            components={{
                ExportLanguageSelector: ({setFieldValue}) => (
                    <LanguageSelector
                        defaultLanguage={defaultLanguage}
                        languages={languages}
                        onChange={newLanguage => {
                            setSelectedLanguage(newLanguage);
                            setFieldValue('language', newLanguage);
                        }}
                        selectedLanguage={selectedLanguage}
                    />
                )
            }}
            fields={getFields()}
            schema={exportSchema.schema}
            handleSubmit={handleFormSubmit}
            initialValues={{language: defaultLanguage}}
            name="data-export-form"
            status={downloadStatus}
        >
            <SlideOver
                handleClose={hideModal}
                visibility={modalKey === 'questionExport' ? visibility : ModalVisibility.HIDDEN}
            >
                <SlideOverContent handleClose={hideModal} title={title}>
                    <p className="text-md mb-6 text-gray-500 sm:text-sm">
                        {strings.questionsList.export.text}
                    </p>
                    <Form.Fields />
                    <Form.Errors />
                </SlideOverContent>
                <SlideOverFooter handleClose={hideModal}>
                    <Form.Submit>{strings.questionsList.export.confirm}</Form.Submit>
                </SlideOverFooter>
            </SlideOver>
        </Form.Container>
    );
};

export default QuestionsExportModal;
