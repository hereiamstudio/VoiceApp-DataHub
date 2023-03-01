describe('Activities API', () => {
    context('GET /api/activities', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/activities'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
