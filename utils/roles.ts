export const ROLES = {
    administrator: 'Administrator',
    assessment_lead: 'Assessment Lead',
    enumerator: 'Enumerator'
};

export const ROLES_THEMES = {
    administrator: 'green',
    assessment_lead: 'orange',
    enumerator: 'yellow'
};

export const ROLES_ACTIONS = {
    administrator: {
        'projects:list': true,
        'projects:get': true,
        'projects:create': true,
        'projects:update': true,
        'projects:archive': true,
        'interviews:list': true,
        'interviews:get': true,
        'interviews:create': true,
        'interviews:update': true,
        'interviews:archive': true,
        'questions:list': true,
        'questions:get': true,
        'questions:create': true,
        'questions:update': true,
        'questions:archive': true,
        'questions:export': true,
        'reports:get': true,
        'reports:update': true,
        'reports:export': true,
        'templates:list': true,
        'templates:get': true,
        'templates:create': true,
        'templates:update': true,
        'templates:archive': true,
        'account:update': true,
        'users:list': true,
        'users:get': true,
        'users:create': true,
        'users:update': true,
        'users:archive': true,
        'users:projectList': true,
        'users:export': true,
        'invites:list': true,
        'activities:list': true
    },
    assessment_lead: {
        'projects:list': true,
        'projects:get': true,
        'projects:create': true,
        'projects:update': true,
        'interviews:list': true,
        'interviews:get': true,
        'interviews:create': true,
        'interviews:update': true,
        'questions:list': true,
        'questions:get': true,
        'questions:create': true,
        'questions:update': true,
        'questions:archive': true,
        'questions:export': true,
        'reports:get': true,
        'reports:update': true,
        'reports:export': true,
        'templates:list': true,
        'templates:get': true,
        'templates:create': true,
        'templates:update': true,
        'templates:archive': true,
        'account:update': true,
        // TODO: filter allowed users in middleware
        // 'users:get': ({userId, authUserId}) => userId === authUserId,
        'users:get': true,
        // 'users:update': ({userId, authUserId}) => userId === authUserId,
        'users:update': true,
        'users:projectList': true,
        'users:export': false,
        'invites:list': false
    },
    enumerator: {
        'users:update': ({userId, authUserId}) => userId === authUserId
    }
};

export const hasClaim = (role: string, action: string, data?: any) => {
    const permissions = ROLES_ACTIONS[role];

    if (permissions) {
        const permissionCheck = permissions?.[action];

        if (typeof permissionCheck === 'function') {
            return permissionCheck(data);
        } else if (permissionCheck) {
            return true;
        }
    }

    return false;
};
