import React, {useContext, useEffect, useState} from 'react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import DataImport from '@/components/DataImport';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import strings from '@/locales/en.json';
import {questionSchema} from '@/schemas/question';
import ToastContext from '@/components/Toast/context';
import {ModalVisibility} from '@/types/index';
import copyValue from '@/utils/copy';
import {formatImportErrors} from '@/utils/helpers';

interface Props {
    handleSuccess: Function;
    interview: any;
    project: any;
    title: string;
}

const QuestionsImportModal: React.FC<Props> = ({handleSuccess, title}: Props) => {
    const {hideModal, modalKey, renderKey, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);
    const [validationErrors, setValidationErrors] = useState(null);
    const [uploadedEntries, setUploadedEntries] = useState<any[]>(null);
    const [uploadStats, setUploadStats] = useState<{error: any[]; success: any[]}>({
        error: [],
        success: []
    });

    const handleSubmit = async (items = uploadedEntries) => {
        addToast({
            title: strings.questionsList.import.success.title,
            text: strings.questionsList.import.success.text,
            type: 'success'
        });
        handleSuccess(items);
        hideModal();
    };

    const handleUploaded = async entries => {
        setValidationErrors(null);

        if (Array.isArray(entries) && entries.length > 0) {
            let errors = [];
            let success = [];

            await Promise.all(
                entries.map(async (entry, index) => {
                    try {
                        const valid = await questionSchema.schema.validateSync(
                            {...entry, options: entry.options?.split('|') || null},
                            {abortEarly: false}
                        );

                        success = [...success, valid];
                    } catch (error) {
                        errors = [
                            ...errors,
                            {
                                row: index + 2,
                                error: formatImportErrors(error, questionSchema.fields)
                            }
                        ];
                    }
                })
            );

            if (errors.length > 0) {
                setValidationErrors(errors);
            } else {
                setUploadedEntries(success);
                handleSubmit(success);
            }
        }
    };

    useEffect(() => {
        setValidationErrors(null);
        setUploadedEntries(null);
        setUploadStats({error: [], success: []});
    }, [renderKey]);

    return (
        <SlideOver
            handleClose={hideModal}
            visibility={modalKey === 'questionsImport' ? visibility : ModalVisibility.HIDDEN}
        >
            <SlideOverContent handleClose={hideModal} title={title}>
                <div className="animate-fade-in" key={uploadedEntries ? 1 : 0}>
                    {uploadedEntries ? (
                        <div>
                            <p className="text-md mb-4 text-gray-500 sm:text-sm">
                                {copyValue('questionsList.import.confirmText', {
                                    size: uploadedEntries.length
                                })}
                            </p>
                            {uploadStats.success.length > 0 && (
                                <p className="text-md text-gray-700 sm:text-sm">
                                    <strong className="font-medium">Successful imports</strong>{' '}
                                    <Badge theme="green">{uploadStats.success.length}</Badge>
                                </p>
                            )}
                            {uploadStats.error.length > 0 && (
                                <p className="text-md space-x-1 text-gray-700 sm:text-sm">
                                    <strong className="font-medium">Errors</strong>{' '}
                                    <Badge theme="red">{uploadStats.error.length}</Badge>
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <DataImport
                                handleUploaded={handleUploaded}
                                model="questions"
                                text={strings.questionsList.import.text}
                                validationErrors={validationErrors}
                            />
                            <div className="my-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
                                <h3 className="text-md mb-1 font-medium leading-6 text-gray-900">
                                    {strings.questionsList.import.template.title}
                                </h3>
                                <p className="text-md mb-4 text-gray-500 sm:text-sm">
                                    {strings.questionsList.import.template.text}
                                </p>
                                <Button
                                    theme="secondary"
                                    url="/user-templates/question-import.xlsx"
                                >
                                    {strings.questionsList.import.template.cta}
                                </Button>
                            </div>
                            <h3 className="text-md mb-1 font-medium leading-6 text-gray-900">
                                {strings.questionsList.import.title}
                            </h3>
                        </>
                    )}
                </div>
            </SlideOverContent>
            <SlideOverFooter handleClose={hideModal} />
        </SlideOver>
    );
};

export default QuestionsImportModal;
