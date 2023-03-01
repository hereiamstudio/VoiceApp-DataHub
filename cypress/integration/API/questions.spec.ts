describe('Questions API', () => {
    context('GET /api/questions', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/questions'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('GET /api/questions/count', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/questions/count'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('GET /api/questions/create', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/questions/create'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('GET /api/questions/export', () => {
        it('should fail if not authorised', () => {
            cy.request({failOnStatusCode: false, method: 'GET', url: '/api/questions/export'}).then(
                response => expect(response.status).to.eq(403)
            );
        });
    });

    context('GET /api/questions/reorder', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/questions/reorder'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/questions/[questionId]', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/questions/[questionId]'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/questions/[questionId]/archive', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/questions/[questionId]/archive'
            }).then(response => expect(response.status).to.eq(403));
        });
    });

    context('GET /api/questions/[questionId]/update', () => {
        it('should fail if not authorised', () => {
            cy.request({
                failOnStatusCode: false,
                method: 'GET',
                url: '/api/questions/[questionId]/update'
            }).then(response => expect(response.status).to.eq(403));
        });
    });
});
