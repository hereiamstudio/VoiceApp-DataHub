describe('Report API', () => {
    context('GET /api/account/[userId]/update', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/account/[userId]/update'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    // context('GET /api/account/[userId]/verify', () => {
    //     it('should fail if not authorised', () => {
    //         cy.request({
    //             failOnStatusCode: false,
    //             method: 'GET',
    //             url: '/api/account/[userId]/verify'
    //         }).then(response => expect(response.status).to.eq(403));
    //     });
    // });
});
