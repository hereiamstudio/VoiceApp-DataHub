import React, {ReactNode} from 'react';

interface Props {
    headings: string[];
    rows: {key: string; content: ReactNode | string}[][];
}

const Table: React.FC<Props> = ({headings, rows}: Props) => (
    <div className="-mx-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {headings.map((heading, index) => (
                        <th
                            key={heading}
                            scope="col"
                            className={`${
                                index > 0 && index < headings.length - 1
                                    ? 'hidden sm:table-cell'
                                    : ''
                            } ${
                                index === 0 ? 'pl-3 pr-2  sm:pl-6' : 'px-2'
                            } py-3 text-left text-sm font-semibold text-gray-900`}
                        >
                            {heading}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((columns, index) => (
                    <tr key={`row-${index}`}>
                        {columns.map(({key, content}, index2) => (
                            <td
                                key={key}
                                className={`${
                                    index2 > 0 && index2 < columns.length - 1
                                        ? 'hidden sm:table-cell'
                                        : ''
                                } ${index2 === 0 ? 'px-4 font-medium sm:pl-6' : 'px-4'} ${
                                    index2 === 0 ? 'text-gray-700' : 'text-gray-500'
                                } whitespace-wrap py-3 align-top text-sm`}
                            >
                                {content}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default Table;
