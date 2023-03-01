import {useState} from 'react';

interface Props {
    itemsPerPage: number;
}

const usePagination = ({itemsPerPage}: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsOffset, setItemsOffset] = useState(0);

    const handlePageChange = (nextPage: number) => {
        setCurrentPage(nextPage);
        setItemsOffset((nextPage - 1) * itemsPerPage);
    };

    const handlePageNext = () => {
        handlePageChange(currentPage + 1);
    };

    const handlePagePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const resetPagination = () => {
        setCurrentPage(1);
        setItemsOffset(0);
    };

    return {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsPerPage,
        itemsOffset,
        resetPagination
    };
};

export default usePagination;
