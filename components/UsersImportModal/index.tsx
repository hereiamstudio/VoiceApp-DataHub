import React, {useContext, useEffect, useState} from 'react';
import {PromisePool} from '@supercharge/promise-pool';
import findKey from 'lodash/findKey';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import DataImport from '@/components/DataImport';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import strings from '@/locales/en.json';
import {createSchema} from '@/schemas/user';
import ToastContext from '@/components/Toast/context';
import {ModalVisibility} from '@/types/index';
import {RequestType} from '@/types/request';
import {COUNTRIES} from '@/utils/countries';
import copyValue from '@/utils/copy';
import fetch, {fetchOptions} from '@/utils/fetch';
import {formatImportErrors} from '@/utils/helpers';

interface Props {
    title: string;
}

const UsersImportModal: React.FC<Props> = ({title}: Props) => {
    const {hideModal, modalKey, renderKey, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);
    const [validationErrors, setValidationErrors] = useState(null);
    const [uploadedEntries, setUploadedEntries] = useState<any[]>(null);
    const [uploadStatus, setUploadStatus] = useState(RequestType.DEFAULT);
    const [uploadStats, setUploadStats] = useState<{error: any[]; success: any[]}>({
        error: [],
        success: []
    });

    const handleSubmit = async (items = uploadedEntries) => {
        try {
            await PromisePool.for(items)
                .withConcurrency(1)
                .handleError(async (error, data) => {
                    setUploadStats(prevUploadStats => ({
                        ...prevUploadStats,
                        error: [...prevUploadStats.error, data]
                    }));

                    return;
                })
                .process(async data => {
                    await fetch(`/api/invites/invite`, fetchOptions({body: data, method: 'post'}));

                    setUploadStats(prevUploadStats => ({
                        ...prevUploadStats,
                        success: [...prevUploadStats.success, data]
                    }));
                })
                .finally(() => {
                    addToast({
                        title: strings.usersList.import.success.title,
                        text: strings.usersList.import.success.text,
                        type: 'success'
                    });
                    hideModal();
                });
        } catch (error) {
            console.log({error});
            // await handleThrown(error);
        }
    };

    const handleDataFormSubmit = async values => {
        // setFileWithValidationErrors(null);
        setUploadStatus(RequestType.PENDING);

        try {
            const formData = new FormData();
            formData.append('file', values.file);

            const response = await fetch('/api/users/import', {
                body: formData,
                headers: {},
                method: 'POST'
            });

            handleUploaded(response);
        } catch (error) {
            addToast({
                title: 'Import error',
                text: error?.message || '',
                type: 'error'
            });
        } finally {
            setUploadStatus(RequestType.DEFAULT);
        }
    };

    const handleUploaded = async entries => {
        setValidationErrors(null);

        if (Array.isArray(entries) && entries.length > 0) {
            const errors = [];
            const success = [];

            await Promise.all(
                entries.map(async (entry, index) => {
                    // Catch Excel/etc. updated the email address string as a hyperlink
                    // (which is parsed as an object with hyperlink/text fields)
                    if (entry.email?.text) {
                        entry.email = entry.email.text;
                    }

                    try {
                        const valid = await createSchema.schema.validateSync(
                            {
                                ...entry,
                                country: findKey(COUNTRIES, i => i === entry.country),
                                is_available_for_projects: true
                            },
                            {abortEarly: false}
                        );

                        success.push(valid);
                    } catch (error) {
                        errors.push({
                            row: index + 2,
                            error: formatImportErrors(error, createSchema.fields)
                        });
                    }
                })
            );

            if (errors.length > 0) {
                setValidationErrors(errors);
            } else if (success.length > 0) {
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
            visibility={modalKey === 'usersImport' ? visibility : ModalVisibility.HIDDEN}
        >
            <SlideOverContent handleClose={hideModal} title={title}>
                <div className="animate-fade-in" key={uploadedEntries ? 1 : 0}>
                    {uploadedEntries ? (
                        <div>
                            <p className="text-md mb-4 text-gray-500 sm:text-sm">
                                {copyValue('usersList.import.confirmText', {
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
                                model="users"
                                text={strings.usersList.import.text}
                                validationErrors={validationErrors}
                            />
                            <div className="my-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
                                <h3 className="text-md mb-1 font-medium leading-6 text-gray-900">
                                    {strings.usersList.import.template.title}
                                </h3>
                                <p className="text-md mb-4 text-gray-500 sm:text-sm">
                                    {strings.usersList.import.template.text}
                                </p>
                                <Button theme="secondary" url="/user-templates/user-import.xlsx">
                                    {strings.usersList.import.template.cta}
                                </Button>
                            </div>
                            <h3 className="text-md mb-1 font-medium leading-6 text-gray-900">
                                {strings.usersList.import.title}
                            </h3>
                        </>
                    )}
                </div>
            </SlideOverContent>
            <SlideOverFooter handleClose={hideModal} />
        </SlideOver>
    );
};

export default UsersImportModal;
