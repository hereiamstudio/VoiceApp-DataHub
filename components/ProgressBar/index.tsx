import React from 'react';
import type {ColourTheme} from '@/types/index';

interface Props {
    percent: number;
    theme?: ColourTheme;
}

const ProgressBar: React.FC<Props> = ({percent = 0, theme = 'green'}: Props) => {
    return (
        <div className={`bg-${theme}-100 relative h-2 w-full overflow-hidden rounded-lg`}>
            <div
                className={`bg-${theme}-400 duration-400 absolute h-full transition-all`}
                style={{width: `${percent}%`}}
            />
        </div>
    );
};

export default ProgressBar;
