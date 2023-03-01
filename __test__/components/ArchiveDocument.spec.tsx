import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ArchiveDocument from '../../components/ArchiveDocument';
import ModalProvider from '../../components/Modal/provider';
import Toast from '../../components/Toast';
import strings from '../../locales/en.json';

describe.skip('Component: ArchiveDocument', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    test('renders an archive section if the document is not archived', async () => {
        const handleUpdate = jest.fn();
        const {getByTestId} = render(
            <ModalProvider>
                <ArchiveDocument
                    handleUpdate={handleUpdate}
                    collection="users"
                    id="abc123"
                    isArchived={false}
                />
            </ModalProvider>
        );

        expect(getByTestId('archive-document')).toBeInTheDocument();
    });

    test('renders a confirmation modal when archive cta is clicked', async () => {
        const handleUpdate = jest.fn();
        const {getByText, getByTestId} = render(
            <>
                <div id="portals" />
                <ModalProvider>
                    <ArchiveDocument
                        handleUpdate={handleUpdate}
                        collection="users"
                        id="abc123"
                        isArchived={false}
                    />
                </ModalProvider>
            </>
        );

        getByTestId('archive-document').click();

        await waitFor(() => {
            expect(getByText(strings.usersUpdate.archive.modal.text)).toBeInTheDocument();
        });
    });

    test('posts to the api when archive is confirmed', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({id: 'abc123'}));
        const handleUpdate = jest.fn();
        const {getByText, getByTestId} = render(
            <>
                <div id="portals" />
                <ModalProvider>
                    <ArchiveDocument
                        handleUpdate={handleUpdate}
                        collection="users"
                        id="abc123"
                        isArchived={false}
                    />
                </ModalProvider>
            </>
        );

        getByTestId('archive-document').click();
        await waitFor(() => {
            expect(getByText(strings.usersUpdate.archive.modal.text)).toBeInTheDocument();
        });
        getByTestId('modal-confirm').click();
        await waitFor(() => {
            expect(fetchMock.mock.calls[0][0]).toEqual('/api/users/abc123/archive');
            expect(fetchMock.mock.calls.length).toEqual(1);
        });
    });

    test('includes additional query parameters in the post to the api', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({id: 'abc123'}));
        const handleUpdate = jest.fn();
        const {getByText, getByTestId} = render(
            <>
                <div id="portals" />
                <ModalProvider>
                    <ArchiveDocument
                        handleUpdate={handleUpdate}
                        collection="users"
                        id="abc123"
                        isArchived={false}
                        queryParams="foo=bar"
                    />
                </ModalProvider>
            </>
        );

        getByTestId('archive-document').click();
        await waitFor(() => {
            expect(getByText(strings.usersUpdate.archive.modal.text)).toBeInTheDocument();
        });
        getByTestId('modal-confirm').click();
        await waitFor(() => {
            expect(fetchMock.mock.calls[0][0]).toEqual('/api/users/abc123/archive?foo=bar');
            expect(fetchMock.mock.calls.length).toEqual(1);
        });
    });

    test('hides the modal when the archive post is successful', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({id: 'abc123'}));
        const handleUpdate = jest.fn();
        const {getByText, getByTestId, queryByText} = render(
            <>
                <div id="portals" />
                <ModalProvider>
                    <ArchiveDocument
                        handleUpdate={handleUpdate}
                        collection="users"
                        id="abc123"
                        isArchived={false}
                    />
                </ModalProvider>
            </>
        );

        getByTestId('archive-document').click();
        await waitFor(() => {
            expect(getByText(strings.usersUpdate.archive.modal.text)).toBeInTheDocument();
        });
        getByTestId('modal-confirm').click();
        await waitFor(
            () => {
                expect(queryByText(strings.usersUpdate.archive.modal.text)).not.toBeInTheDocument();
            },
            {timeout: 1500}
        );
    });

    test('renders a restore section if the document is already archived', async () => {
        const handleUpdate = jest.fn();
        const {getByText} = render(
            <ModalProvider>
                <ArchiveDocument
                    handleUpdate={handleUpdate}
                    collection="users"
                    id="abc123"
                    isArchived={true}
                />
            </ModalProvider>
        );

        expect(getByText(strings.usersUpdate.restore.cta)).toBeInTheDocument();
    });
});
