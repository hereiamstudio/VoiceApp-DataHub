import React from 'react';
import Button from '@/components/Button';

interface Props {
    handleNext: Function;
    handlePrevious: Function;
    page: number;
    showNext: boolean;
}

const Pagination: React.FC<Props> = ({
    handleNext,
    handlePrevious,
    page,
    showNext = true
}: Props) => (
    <nav className="flex items-center justify-between overflow-hidden py-3">
        <div className="hidden sm:block">
            <p className="text-sm leading-5 text-gray-700" data-testid="pagination-results">
                Page {page}
            </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
            <Button
                disabled={page === 1}
                onClick={() => (page !== 1 ? handlePrevious() : null)}
                theme="white"
            >
                Previous
            </Button>
            <Button classes="ml-3" disabled={!showNext} onClick={handleNext} theme="white">
                Next
            </Button>
        </div>
    </nav>
);

export default Pagination;
