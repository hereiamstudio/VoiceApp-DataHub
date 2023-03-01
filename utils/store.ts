import {atom} from 'recoil';
import {ModalVisibility} from '@/types/index';

export const projectsListFilterState = atom({
    key: 'projectsListFilter',
    default: {
        filters: {is_archived: false},
        sort: 'created_at,desc'
    }
});

export const interviewsListFilterState = atom({
    key: 'interviewsListFilter',
    default: {
        filters: {is_archived: false, status: 'any'}
    }
});

export const questionsListFilterState = atom({
    key: 'questionsListFilter',
    default: {
        filters: {is_archived: false}
    }
});

//

export const usersListFilterState = atom({
    key: 'usersListFilter',
    default: {
        filters: {is_archived: false}
    }
});

export const authUserInitialisedState = atom({
    key: 'authUserInitialised',
    default: false
});

export const authUserState = atom({
    key: 'authUser',
    default: null
});

//

export const sidebarStatusState = atom({
    key: 'sidebarStatus',
    default: ModalVisibility.HIDDEN
});

//

export const templatesListFilterState = atom({
    key: 'templatesListFilter',
    default: {
        filters: {is_archived: false, type: 'any'}
    }
});

//

export const activitiesListFilterState = atom({
    key: 'activitysListFilter',
    default: {
        filters: {type: 'any'}
    }
});
