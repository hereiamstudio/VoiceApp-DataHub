describe('Users API', () => {
    context('GET /api/users', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/users'}).then(response =>
                expect(response.status).to.eq(403)
            );
        });
    });

    context('GET /api/users/available-for-projects', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/available-for-projects'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/create', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/create'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/export', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/export'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/filter-options', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/filter-options'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/[userId]', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/[userId]/'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/[userId]/archive', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/[userId]/archive/'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/[userId]/project-list', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/[userId]/project-list/'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/users/[userId]/update', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/users/[userId]/update/'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
