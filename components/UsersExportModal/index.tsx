import React, {useContext, useEffect, useState} from 'react';
import {Formik, Form} from 'formik';
import Button from '@/components/Button';
import InputCheckboxToggle from '@/components/InputCheckboxToggle';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import SelectField from '@/components/SelectField';
import strings from '@/locales/en.json';
import {ModalVisibility} from '@/types/index';
import {ExportFields} from '@/types/user';
import {RequestType} from '@/types/request';
import getCopyValue from '@/utils/copy';
import {humanise} from '@/utils/helpers';

interface Props {
    title: string;
}

const UsersExportModal: React.FC<Props> = ({title}: Props) => {
    const {hideModal, modalKey, visibility} = useContext(ModalContext);
    const [downloadStatus, setDownloadStatus] = useState(RequestType.DEFAULT);

    /**
     * Fields which cannot be excluded are disabled. Ideally we will have a better UI for this.
     */
    const DISABLED_FIELDS = [
        ExportFields.FIRST_NAME,
        ExportFields.LAST_NAME,
        ExportFields.ROLE,
        ExportFields.COMPANY_NAME
    ];

    /**
     * By default, all fields will be exported. For each field, set its form value to 'true'.
     */
    const initialValues = {
        fields: Object.keys(ExportFields).reduce((obj, key) => {
            obj[ExportFields[key]] = true;
            return obj;
        }, {}),
        type: 'excel'
    };

    const handleFormSubmit = values => {
        const excluded = Object.keys(values.fields)
            .filter(i => !values.fields[i])
            .join(',');
        const downloadUrl = `/api/users/export?title=${title}&exclude=${excluded}&type=${values.type}`;

        setDownloadStatus(RequestType.PENDING);
        setTimeout(() => setDownloadStatus(RequestType.DEFAULT), 1500);
        window.location.href = downloadUrl;
        setTimeout(() => hideModal(), 500);
    };

    return (
        <Formik enableReinitialize={true} onSubmit={handleFormSubmit} initialValues={initialValues}>
            {({handleSubmit, values}) => (
                <Form className="mt-4 sm:mt-6" data-testid="project-create-form">
                    <SlideOver
                        handleClose={hideModal}
                        visibility={
                            modalKey === 'usersExport' ? visibility : ModalVisibility.HIDDEN
                        }
                    >
                        <SlideOverContent handleClose={hideModal} title={title}>
                            <p className="text-md text-gray-500 sm:text-sm">
                                {strings.usersList.export.text}
                            </p>

                            <span className="mb-1 mt-4 inline-block truncate text-sm font-medium leading-5 text-gray-700">
                                {strings.usersList.export.fields}
                            </span>
                            <div className="overflow-hidden rounded-lg bg-white p-1 shadow-sm sm:py-2 sm:px-4">
                                {Object.keys(ExportFields).map((field, index) => {
                                    const isFieldDisabled = DISABLED_FIELDS.includes(
                                        ExportFields[field]
                                    );

                                    return (
                                        <div
                                            key={field}
                                            className={`py-1 lg:py-2 ${
                                                index < Object.keys(ExportFields).length - 1
                                                    ? 'border-b border-gray-200'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex">
                                                <div className="flex-shrink-0 pr-6">
                                                    <InputCheckboxToggle
                                                        isDisabled={isFieldDisabled}
                                                        name={`fields.${ExportFields[field]}`}
                                                    />
                                                </div>
                                                <label
                                                    htmlFor={`fields.${ExportFields[field]}`}
                                                    className={`font-medium text-gray-600 sm:text-sm ${
                                                        isFieldDisabled
                                                            ? 'pointer-events-none'
                                                            : 'cursor-pointer'
                                                    }`}
                                                >
                                                    {humanise(ExportFields[field])}
                                                    <div className="block text-sm text-gray-400 sm:text-xs">
                                                        {
                                                            strings.usersList.exportFields[
                                                                ExportFields[field]
                                                            ]
                                                        }
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 max-w-sm">
                                <SelectField
                                    name="type"
                                    options={[
                                        {label: 'CSV', value: 'csv'},
                                        {label: 'Excel', value: 'excel'}
                                    ]}
                                />
                            </div>
                        </SlideOverContent>
                        <SlideOverFooter handleClose={hideModal}>
                            <Button onClick={handleSubmit} type="submit" state={downloadStatus}>
                                {strings.usersList.export.confirm}
                            </Button>
                        </SlideOverFooter>{' '}
                    </SlideOver>
                </Form>
            )}
        </Formik>
    );
};

export default UsersExportModal;
