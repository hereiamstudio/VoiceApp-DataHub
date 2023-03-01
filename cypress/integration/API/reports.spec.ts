describe('Reports API', () => {
    context('GET /api/reports', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/reports'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/reports/export', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/reports/export'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/reports/open-responses', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/reports/open-responses'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/reports/proof-enumerator-note', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/reports/proof-enumerator-note'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/reports/proof-open-response', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/reports/proof-open-response'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
