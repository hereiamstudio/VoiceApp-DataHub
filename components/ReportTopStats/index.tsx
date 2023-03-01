import React, {useContext} from 'react';
import dayjs from 'dayjs';
import CountBadge from '@/components/CountBadge';
import ModalContext from '@/components/Modal/context';
import strings from '@/locales/en.json';

interface Props {
    additionalConsentPercent: number;
    averageDuration: number;
    beneficiaryPercent: number;
    flaggedQuestionCount: number;
    gendersPercent: {
        male: number;
        female: number;
        other: number;
    };
    ignoredQuestionCount: number;
    respondentsCount: number;
    skippedQuestionCount: number;
    starredQuestionCount: number;
}

const ReportTopStats: React.FC<Props> = ({
    additionalConsentPercent,
    averageDuration,
    beneficiaryPercent,
    flaggedQuestionCount,
    gendersPercent,
    ignoredQuestionCount,
    respondentsCount,
    skippedQuestionCount,
    starredQuestionCount
}: Props) => {
    const {showModal} = useContext(ModalContext);

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
            <div className="animate-fade-in-up col-span-3 animation-delay-100 sm:flex">
                <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dl>
                            <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                {strings.reportsList.stats.responses}
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold leading-9 text-gray-900">
                                {respondentsCount}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in-up col-span-3 animation-delay-200 sm:flex">
                <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dl>
                            <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                {strings.reportsList.stats.duration}
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold leading-9 text-gray-900">
                                {dayjs(averageDuration).format('mm[m] ss[s]')}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in-up col-span-3 animation-delay-300 sm:flex">
                <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dl>
                            <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                {strings.reportsList.stats.beneficiary}
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold leading-9 text-gray-900">
                                {beneficiaryPercent}
                                <span className="text-xl font-medium text-gray-500">%</span>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in-up col-span-3 animation-delay-400 sm:flex">
                <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dl>
                            <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                {strings.reportsList.stats.additionalConsent}
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold leading-9 text-gray-900">
                                {additionalConsentPercent}
                                <span className="text-xl font-medium text-gray-500">%</span>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in-up col-span-6 animation-delay-500 sm:flex">
                <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dl>
                            <dd className="mt-1 font-semibold text-gray-900">
                                <div className="flex">
                                    <div>
                                        <div className="truncate text-sm font-medium leading-5 text-gray-500">
                                            {strings.reportsList.stats.male}
                                        </div>
                                        <span className="text-3xl leading-9">
                                            {gendersPercent.male}
                                            <span className="text-xl font-medium text-gray-500">
                                                %
                                            </span>
                                        </span>
                                    </div>
                                    <div className="px-4 text-3xl font-normal leading-9 text-gray-200">
                                        /
                                    </div>
                                    <div>
                                        <div className="truncate text-sm font-medium leading-5 text-gray-500">
                                            {strings.reportsList.stats.female}
                                        </div>{' '}
                                        <span className="text-3xl leading-9">
                                            {gendersPercent.female}
                                            <span className="text-xl font-medium text-gray-500">
                                                %
                                            </span>
                                        </span>
                                    </div>
                                    <div className="px-4 text-3xl font-normal leading-9 text-gray-200">
                                        /
                                    </div>
                                    <div>
                                        <div className="truncate text-sm font-medium leading-5 text-gray-500">
                                            {strings.reportsList.stats.other}
                                        </div>
                                        <span className="text-3xl leading-9">
                                            {gendersPercent.other}
                                            <span className="text-xl font-medium text-gray-500">
                                                %
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in-up col-span-6 animation-delay-600 sm:flex">
                <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dl>
                            <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                {strings.reportsList.stats.counts}
                            </dt>
                            <dd className="mt-1 space-x-2 text-3xl font-semibold leading-9 text-gray-900">
                                <button
                                    className={`${
                                        skippedQuestionCount > 0 ? 'group' : 'pointer-events-none'
                                    }`}
                                    onClick={() => {
                                        if (skippedQuestionCount > 0) {
                                            showModal('reportFilteredResponses', {
                                                filter: 'skipped',
                                                subtitle: strings.reportsList.allQuestionsFiltered,
                                                title: strings.reportsList.filters.skipped
                                            });
                                        }
                                    }}
                                    type="button"
                                >
                                    <CountBadge
                                        count={skippedQuestionCount}
                                        label={strings.reportsList.stats.skipped}
                                        theme="yellow"
                                    />
                                </button>
                                <button
                                    className={
                                        ignoredQuestionCount > 0 ? 'group' : 'pointer-events-none'
                                    }
                                    onClick={() => {
                                        if (ignoredQuestionCount > 0) {
                                            showModal('reportFilteredResponses', {
                                                filter: 'ignored',
                                                subtitle: strings.reportsList.allQuestionsFiltered,
                                                title: strings.reportsList.filters.ignored
                                            });
                                        }
                                    }}
                                    type="button"
                                >
                                    <CountBadge
                                        count={ignoredQuestionCount}
                                        label={strings.reportsList.stats.ignored}
                                        theme="blue"
                                    />
                                </button>
                                <button
                                    className={`${
                                        starredQuestionCount > 0 ? 'group' : 'pointer-events-none'
                                    }`}
                                    onClick={() => {
                                        if (starredQuestionCount > 0) {
                                            showModal('reportFilteredResponses', {
                                                filter: 'starred',
                                                subtitle: strings.reportsList.allQuestionsFiltered,
                                                title: strings.reportsList.filters.starred
                                            });
                                        }
                                    }}
                                    type="button"
                                >
                                    <CountBadge
                                        count={starredQuestionCount}
                                        label={strings.reportsList.stats.starred}
                                        theme="orange"
                                    />
                                </button>
                                <button
                                    className={
                                        flaggedQuestionCount > 0 ? 'group' : 'pointer-events-none'
                                    }
                                    onClick={() => {
                                        if (flaggedQuestionCount > 0) {
                                            showModal('reportFilteredResponses', {
                                                filter: 'flagged',
                                                subtitle: strings.reportsList.allQuestionsFiltered,
                                                title: strings.reportsList.filters.flagged
                                            });
                                        }
                                    }}
                                    type="button"
                                >
                                    <CountBadge
                                        count={flaggedQuestionCount}
                                        label={strings.reportsList.stats.flagged}
                                        theme="red"
                                    />
                                </button>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportTopStats;
