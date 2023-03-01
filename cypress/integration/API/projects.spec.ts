describe('Projects API', () => {
    context('GET /api/projects', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/projects'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('POST /api/projects/create', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/projects/create'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
    context('GET /api/projects/[projectId]', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/projects/ABC123'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /api/projects/[projectId]/archive', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/projects/ABC123/archive'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /api/projects/[projectId]/update', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/projects/ABC123/update'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
