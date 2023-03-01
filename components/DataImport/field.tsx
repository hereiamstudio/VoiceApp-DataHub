import React from 'react';
import {useDropzone} from 'react-dropzone';
import {useFormikContext} from 'formik';
import Button from '@/components/Button';
import strings from '@/locales/en.json';
import {formatBytesToSize} from '@/utils/helpers';

interface Props {
    handleFileChange?: Function;
    file?: any;
}

const DataImportField: React.FC<Props> = ({handleFileChange, file}: Props) => {
    const {setFieldValue} = useFormikContext();

    const onDrop = async acceptedFiles => {
        if (acceptedFiles.length) {
            if (handleFileChange) {
                handleFileChange(acceptedFiles[0]);
            }

            setFieldValue('file', acceptedFiles[0]);
        }
    };

    const {acceptedFiles, getRootProps, getInputProps, isDragActive, open} = useDropzone({
        maxFiles: 1,
        noClick: true,
        noKeyboard: true,
        onDrop
    });

    return (
        <div
            {...getRootProps()}
            className={`${
                isDragActive ? 'bg-grey-100 border-grey-100' : 'border-gray-400 bg-gray-50'
            } flex items-center rounded-lg border border-dashed p-3 transition duration-200 ease-out`}
        >
            <input {...getInputProps()} />
            <div className="my-2 block flex-grow pr-6 text-sm text-gray-500 opacity-75">
                {acceptedFiles?.length > 0
                    ? acceptedFiles.map((file: any) => (
                          <span key={file.path}>
                              <span className="font-extrabold">{file.path}</span>
                              <span className="ml-2 text-sm uppercase">
                                  {formatBytesToSize(file.size)}
                              </span>
                          </span>
                      ))
                    : strings.usersList.import.dropzone}
            </div>
            <div className="flex-shrink-0">
                <Button onClick={open} size="sm" theme="white">
                    {strings.usersList.import.fileCta}
                </Button>
            </div>
        </div>
    );
};

export default DataImportField;
