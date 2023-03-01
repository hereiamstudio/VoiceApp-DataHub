import React, {useContext, useState} from 'react';
import ActionPanel from '@/components/ActionPanel';
import AlertModal from '@/components/AlertModal';
import Button from '@/components/Button';
import FormSection from '@/components/FormSection';
import ModalContext from '@/components/Modal/context';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import fetch, {fetchOptions} from '@/utils/fetch';
import {ModalVisibility} from '@/types/index';
import {RequestType} from '@/types/request';

interface Props {
    collection: string;
    handleUpdate: Function;
    id: string;
    isArchived?: boolean;
    queryParams?: string;
}

const ArchiveDocument: React.FC<Props> = ({
    collection,
    handleUpdate,
    id,
    isArchived,
    queryParams
}: Props) => {
    const {hideModal, modalKey, showModal, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});

    // TODO: This is a workaround until all pages follow the new convention.
    let _strings: any;

    if (strings[`${collection}Update`]) {
        _strings = strings[`${collection}Update`];
    } else {
        _strings = strings[collection];
    }

    const handleArchive = async (is_archived: boolean) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/${collection.replace('Sections', '')}/${id}/archive${
                    queryParams ? `?${queryParams}` : ''
                }`,
                fetchOptions({body: {is_archived}, method: is_archived ? 'delete' : 'put'})
            );

            handleUpdate(is_archived);
            hideModal();
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            addToast({
                title: _strings[is_archived ? 'archive' : 'restore'].updateSuccess.title,
                text: _strings[is_archived ? 'archive' : 'restore'].updateSuccess.text,
                type: 'success'
            });
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: error?.data?.message || error.message,
                type: 'error'
            });
            hideModal();
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
        }
    };

    return (
        <>
            <div className="animate-fade-in">
                {isArchived === true ? (
                    <ActionPanel
                        cta={{
                            label: _strings.restore.cta,
                            onClick: () => handleArchive(false),
                            state: formStatus.status,
                            theme: 'secondary'
                        }}
                        title={_strings.restore.title}
                        text={_strings.restore.text}
                    />
                ) : (
                    <FormSection
                        showForm={false}
                        text={_strings.archive.text}
                        title={_strings.archive.title}
                    >
                        <div className="sm:text-right">
                            <Button
                                disabled={formStatus.status !== RequestType.DEFAULT}
                                icon="archive"
                                onClick={() => showModal('archiveAlert')}
                                state={formStatus.status}
                                data-testid="archive-document"
                                theme="destructive"
                            >
                                {_strings.archive.cta}
                            </Button>
                        </div>
                    </FormSection>
                )}
            </div>
            <AlertModal
                cancelCta={{
                    label: _strings.archive.modal.cancel,
                    onClick: () => hideModal()
                }}
                confirmCta={{
                    label: _strings.archive.modal.confirm,
                    onClick: () => handleArchive(true),
                    state: formStatus.status
                }}
                handleHide={hideModal}
                text={_strings.archive.modal.text}
                title={_strings.archive.modal.title}
                visibility={modalKey === 'archiveAlert' ? visibility : ModalVisibility.HIDDEN}
                type="error"
            />
        </>
    );
};

export default ArchiveDocument;
