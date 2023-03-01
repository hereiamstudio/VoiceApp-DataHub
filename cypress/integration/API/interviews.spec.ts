describe('Interviews API', () => {
    context('GET /api/interviews', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/interviews'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('POST /interviews/create', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/interviews/create'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
    context('GET /api/interviews/[projectId]', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/interviews/ABC123'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /interviews/[projectId]/archive', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/interviews/ABC123/archive'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /interviews/[projectId]/update', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/interviews/ABC123/update'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /interviews/[projectId]/overview', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/interviews/ABC123/overview'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
