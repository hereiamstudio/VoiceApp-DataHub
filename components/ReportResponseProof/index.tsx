import React, {useContext, useState} from 'react';
import {useSession} from 'next-auth/react';
import Button from '@/components/Button';
import ToastContext from '@/components/../components/Toast/context';
import strings from '@/locales/en.json';
import fetch, {fetchOptions} from '@/utils/fetch';
import {RequestType} from '@/types/request';
import getCopyValue from '@/utils/copy';

interface Props {
    endpoint: string;
    handleSuccess: Function;
    original: string;
    type: 'note' | 'open response';
}

const ReportResponseProof: React.FC<Props> = ({endpoint, handleSuccess, original, type}: Props) => {
    const [formText, setFormText] = useState(original);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);
    const {data: session} = useSession();

    const handleFormTextChange = event => {
        const {value} = event.target;

        setFormText(value);
    };

    const handleSubmit = async () => {
        if (!formText.length) {
            return;
        }

        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                endpoint,
                fetchOptions({
                    body: {
                        proofed: formText,
                        original
                    },
                    method: 'post'
                })
            );

            addToast({
                title: strings.reportsList.proof.success.title,
                text: getCopyValue('reportsList.proof.success.text', {type}),
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            handleSuccess({
                is_proofed: true,
                original,
                proofed: formText,
                proofed_at: new Date().getTime(),
                proofed_by: {
                    first_name: session.user.first_name,
                    id: session.user.uid,
                    last_name: session.user.last_name
                }
            });
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: error?.data?.message || error.message,
                type: 'error'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
        }
    };

    return (
        <div className="text-right">
            <textarea
                autoFocus={true}
                className="form-input focus:shadow-outline-pink mt-1 block w-full rounded-md border py-2 px-3 shadow-sm transition duration-150 ease-in-out focus:border-pink-300 focus:outline-none focus:ring-pink-300 sm:text-sm sm:leading-5"
                onChange={handleFormTextChange}
                rows={5}
                value={formText}
            />

            <Button classes="mt-2" onClick={handleSubmit} state={formStatus.status} type="button">
                {strings.reportsList.proof.save}
            </Button>
        </div>
    );
};

export default ReportResponseProof;
