describe('Invites API', () => {
    context('GET /api/invites', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/invites'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('GET /api/invites/invite', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/invites/invite'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    // context('GET /api/invites/register', () => {
    //     it('should fail if not authorised', () => {
    //         cy.request({failOnStatusCode: false, method: 'GET', url: '/api/invites/register'}).then(
    //             response => expect(response.status).to.eq(403)
    //         );
    //     });
    // });

    context('GET /api/invites/[inviteId]', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/invites/[inviteId]'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/invites/[inviteId]/revoke', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/invites/[inviteId]/revoke'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/invites/[inviteId]/resend-invitation', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/invites/[inviteId]/resend-invitation'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
