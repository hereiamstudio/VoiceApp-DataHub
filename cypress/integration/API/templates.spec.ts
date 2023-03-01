describe('Templates API', () => {
    context('GET /api/templates', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/templates'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('POST /templates/create', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/templates/create'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/templates/[templateId]', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/templates/[templateId]'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /api/templates/[templateId]/archive', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/templates/[templateId]/archive'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('POST /api/templates/[templateId]/update', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'POST',
                url: '/api/templates/[templateId]/update'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
