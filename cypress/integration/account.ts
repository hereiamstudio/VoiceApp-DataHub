describe('Account', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        describe('Update account', () => {
            it('should redirect to login page', () => {
                cy.visit('/account');
                cy.url().should('include', '/login');
            });
        });
    });
});
