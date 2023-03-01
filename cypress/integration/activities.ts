describe('Activities', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        describe('View all activities', () => {
            it('should redirect to login page', () => {
                cy.visit('/activities');
                cy.url().should('include', '/login');
            });
        });
    });
});
