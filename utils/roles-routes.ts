// Create a reference to roles for page names to use in middleware
export const API_PERMISSIONS = {
    // accounts
    '/api/account/[userId]/update': 'account:update',
    '/api/account/[userId]/verify': '',
    // activities
    '/api/activities': 'activities:list',
    // data imports
    '/api/data-import': 'questions:create',
    // interviews
    '/api/interviews': 'interviews:list',
    '/api/interviews/create': 'interviews:create',
    '/api/interviews/[interviewId]': 'interviews:update',
    '/api/interviews/[interviewId]/archive': 'interviews:update',
    '/api/interviews/[interviewId]/overview': 'interviews:list',
    '/api/interviews/[interviewId]/update': 'interviews:update',
    // invites
    '/api/invites': 'users:list',
    '/api/invites/invite': 'users:create',
    '/api/invites/register': '',
    '/api/invites/[id]': 'users:update',
    '/api/invites/[id]/resend-invitation': 'users:create',
    '/api/invites/[id]/revoke': 'users:update',
    // projects
    '/api/projects': 'projects:list',
    '/api/projects/create': 'projects:create',
    '/api/projects/[projectId]': 'projects:update',
    '/api/projects/[projectId]/archive': 'projects:update',
    '/api/projects/[projectId]/update': 'projects:update',
    // questions
    '/api/questions': 'questions:list',
    '/api/questions/count': 'questions:list',
    '/api/questions/export': 'questions:export',
    '/api/questions/update': 'questions:update',
    // reports
    '/api/reports': 'reports:get',
    '/api/reports/export': 'reports:export',
    '/api/reports/open-responses': 'reports:get',
    '/api/reports/proof-enumerator-note': 'reports:update',
    '/api/reports/proof-open-response': 'reports:update',
    // templates
    '/api/templates': 'templates:list',
    '/api/templates/create': 'templates:create',
    '/api/templates/[templateId]': 'templates:update',
    '/api/templates/[templateId]/archive': 'templates:update',
    '/api/templates/[templateId]/update': 'templates:update',
    // users
    '/api/users': 'users:list',
    '/api/users/available-for-projects': 'projects:create',
    '/api/users/create': 'users:create',
    '/api/users/invites': 'users:create',
    '/api/users/export': 'users:export',
    '/api/users/filter-options': 'users:list',
    '/api/users/[userId]': 'users:get',
    '/api/users/[userId]/archive': 'users:update',
    '/api/users/[userId]/project-list': 'users:list',
    '/api/users/[userId]/update': 'users:update'
};

// Create a reference to roles for page names to use in middleware
export const PAGE_PERMISSIONS = {
    // account
    // This page has its another check on the page since we need values to compare.
    // Not sure how best to handle this via middleware just yet...
    '/account': 'account:update',
    // activities
    '/activities': 'activities:list',
    // projects
    '/projects': 'projects:list',
    '/projects/create': 'projects:create',
    // TODO: Report this bug. Predefined route is not taking precedence over dynamic route.
    // This is not happening locally, only on deployment to Vercel
    // https://nextjs.org/docs/routing/dynamic-routes#caveats
    '/projects/[projectId]': 'projects:create',
    '/projects/[projectId]/update': 'projects:update',
    // interviews
    '/projects/[projectId]/interviews': 'interviews:list',
    '/projects/[projectId]/interviews/create': 'interviews:create',
    // TODO: Report this bug. Predefined route is not taking precedence over dynamic route.
    // This is not happening locally, only on deployment to Vercel
    // https://nextjs.org/docs/routing/dynamic-routes#caveats
    '/projects/[projectId]/interviews/[interviewId]': 'interviews:create',
    '/projects/[projectId]/interviews/[interviewId]/[page]': 'interviews:update',
    // questions
    '/projects/[projectId]/interviews/[interviewId]/questions': 'questions:list',
    '/projects/[projectId]/interviews/[interviewId]/questions/create': 'questions:create',
    '/projects/[projectId]/interviews/[interviewId]/questions/update': 'questions:update',
    // templates
    '/templates': 'templates:list',
    '/templates/create/consent': 'templates:create',
    '/templates/create/probing_question': 'templates:create',
    '/templates/create/question': 'templates:create',
    '/templates/[templateId]/update/consent': 'templates:update',
    '/templates/[templateId]/update/probing_question': 'templates:update',
    '/templates/[templateId]/update/question': 'templates:update',
    // users
    '/users': 'users:list',
    '/users/create': 'users:create',
    '/users/invites': 'users:create',
    '/users/[userId]/update': 'users:update'
};
