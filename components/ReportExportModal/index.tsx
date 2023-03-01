import React, {useContext, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import Form from '@/components/Form';
import InputCheckboxToggle from '@/components/InputCheckboxToggle';
import LanguageSelector from '@/components/LanguageSelector';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {exportSchema} from '@/schemas/dataExport';
import {ModalVisibility} from '@/types/index';
import {ReportExportFields} from '@/types/report';
import {RequestType} from '@/types/request';
import {humanise} from '@/utils/helpers';

interface Props {
    defaultLanguage;
    interviewIds: string[];
    languages: string[];
    projectId: string;
    title: string;
    type?: 'interview' | 'project';
}

const ReportExportModal: React.FC<Props> = ({
    defaultLanguage,
    interviewIds,
    languages,
    projectId,
    title,
    type = 'interview'
}: Props) => {
    const {data: session} = useSession();
    const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
    const {hideModal, modalKey, visibility} = useContext(ModalContext);
    const [downloadStatus, setDownloadStatus] = useState(RequestType.DEFAULT);
    const {addToast} = useContext(ToastContext);

    /**
     * Fields which cannot be excluded are disabled. Ideally we will have a better UI for this.
     */
    const DISABLED_FIELDS = [
        ReportExportFields.INTERVIEW,
        ReportExportFields.PROJECT,
        ReportExportFields.QUESTION_ANSWER,
        ReportExportFields.QUESTION_TITLE
    ];

    /**
     * Fields which are active by default
     */
    const ACTIVE_FIELDS = [
        ReportExportFields.INTERVIEW,
        ReportExportFields.PROJECT,
        ReportExportFields.QUESTION_ANSWER,
        ReportExportFields.QUESTION_TITLE,
        ReportExportFields.QUESTION_IS_SKIPPED,
        ReportExportFields.QUESTION_IS_IGNORED,
        ReportExportFields.ENUMERATOR_ID,
        ReportExportFields.ENUMERATOR_NOTES,
        ReportExportFields.AGE,
        ReportExportFields.GENDER
    ];

    /**
     * By default, all fields will be exported. For each field, set its form value to 'true'.
     */
    const initialValues = {
        fields: Object.keys(ReportExportFields).reduce((obj, key) => {
            obj[ReportExportFields[key]] = ACTIVE_FIELDS.includes(ReportExportFields[key]);
            return obj;
        }, {}),
        type: 'excel'
    };

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

    const handleFormSubmit = async values => {
        try {
            const token = session.user.token;
            const excluded = Object.keys(values.fields)
                .filter(i => !values.fields[i])
                .join(',');
            const path = `${process.env.NEXT_PUBLIC_REPORT_EXPORT_API_URL}/reports-exportInterviewResponsesToFile`;
            // const path = '/api/reports/export';
            const downloadParams = {
                title,
                projectId,
                interviewIds: interviewIds.join(','),
                exclude: excluded,
                token,
                key: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_API_KEY,
                type: values.type,
                language: values.language,
                primary_language: defaultLanguage,
                redirectUrl: process.env.NEXT_PUBLIC_HOST_URL || process.env.NEXT_PUBLIC_VERCEL_URL
            };
            const downloadUrl = `${path}?${new URLSearchParams(downloadParams).toString()}`;

            setDownloadStatus(RequestType.PENDING);
            addToast({
                title: strings.reportsList.exported.title,
                text: strings.reportsList.exported.text,
                type: 'success'
            });
            setTimeout(() => setDownloadStatus(RequestType.DEFAULT), 500);
            window.location.href = downloadUrl;
            setTimeout(() => hideModal(), 500);
        } catch (error) {
            addToast({
                text: 'Sorry, there was an error exporting the report. Please try again.',
                type: 'error'
            });
        }
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
                ),
                FieldsSelector: ({setFieldValue}) => (
                    <div>
                        <span className="mb-1 mt-4 inline-block truncate text-sm font-medium leading-5 text-gray-700">
                            {strings.reportsList.export.fields}
                        </span>
                        <div className="overflow-hidden rounded-lg bg-white p-1 shadow-sm sm:py-2 sm:px-4">
                            {Object.keys(ReportExportFields).map((field, index) => {
                                const isFieldDisabled = DISABLED_FIELDS.includes(
                                    ReportExportFields[field]
                                );

                                return (
                                    <div
                                        key={field}
                                        className={`py-1 lg:py-2 ${
                                            index < Object.keys(ReportExportFields).length - 1
                                                ? 'border-b border-gray-200'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex">
                                            <div className="flex-shrink-0 pr-6">
                                                <InputCheckboxToggle
                                                    isDisabled={isFieldDisabled}
                                                    name={`fields.${ReportExportFields[field]}`}
                                                />
                                            </div>
                                            <label
                                                htmlFor={`fields.${ReportExportFields[field]}`}
                                                className={`font-medium text-gray-600 sm:text-sm ${
                                                    isFieldDisabled
                                                        ? 'pointer-events-none'
                                                        : 'cursor-pointer'
                                                }`}
                                            >
                                                {humanise(ReportExportFields[field])}
                                                <div className="block text-sm text-gray-400 sm:text-xs">
                                                    {
                                                        strings.reportsList.exportFields[
                                                            ReportExportFields[field]
                                                        ]
                                                    }
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }}
            fields={getFields()}
            schema={exportSchema.schema}
            handleSubmit={handleFormSubmit}
            initialValues={{...initialValues, language: selectedLanguage}}
            name="data-export-form"
            status={downloadStatus}
        >
            <SlideOver
                handleClose={hideModal}
                visibility={modalKey === 'reportExport' ? visibility : ModalVisibility.HIDDEN}
            >
                <SlideOverContent handleClose={hideModal} title={title}>
                    <p className="text-md mb-6 text-gray-500 sm:text-sm">
                        {strings.reportsList.export.text}
                    </p>
                    <Form.Fields />
                    <Form.Errors />
                </SlideOverContent>
                <SlideOverFooter handleClose={hideModal}>
                    <Form.Submit>{strings.reportsList.export.confirm}</Form.Submit>
                </SlideOverFooter>
            </SlideOver>
        </Form.Container>
    );
};

export default ReportExportModal;
