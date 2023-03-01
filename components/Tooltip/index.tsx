import React, {ReactNode} from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Icon from '@/components/Icon';

interface Props {
    children: ReactNode;
    delay?: number;
    text: string;
}

const TooltipWrapper: React.FC<Props> = ({children, delay = 500, text}: Props) => (
    <Tooltip.Root delayDuration={delay}>
        <Tooltip.Trigger data-testid="tooltip">{children}</Tooltip.Trigger>
        <Tooltip.Content
            className="max-w-sm rounded bg-pink-600 py-1 px-2 text-[13px] text-white shadow-lg"
            align="center"
            side="top"
        >
            {text}
            <Tooltip.Arrow className="fill-pink-600" />
        </Tooltip.Content>
    </Tooltip.Root>
);

export default TooltipWrapper;
