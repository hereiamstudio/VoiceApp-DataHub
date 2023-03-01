import React, {ReactNode} from 'react';
import ConditionalWrapper from '@/components/ConditionalWrapper';
import Tooltip from '@/components/Tooltip';

interface Props {
    children: ReactNode;
    number: number;
    totalOptions: number;
    totalQuestions: number;
    type: string;
}

const AddSkipLogicCta: React.FC<Props> = ({
    children,
    number,
    totalOptions,
    totalQuestions,
    type
}: Props) => {
    let tooltip = '';

    if (type === 'free_text') {
        tooltip = 'Only coded questions are supported.';
    } else if (number === totalQuestions) {
        tooltip = 'There are no further questions to skip to.';
    } else if (totalOptions < 2) {
        tooltip = 'You must add 2 or more options.';
    } else if (totalQuestions < 2) {
        tooltip = 'You must add 3 or more questions.';
    }

    return (
        <ConditionalWrapper
            condition={tooltip}
            wrapper={children => (
                <Tooltip text={`You can't add skip logic to this question. ${tooltip}`} delay={0}>
                    {children}
                </Tooltip>
            )}
        >
            {children}
        </ConditionalWrapper>
    );
};

export default AddSkipLogicCta;
