describe('Users', () => {
    context('When not authenticated', () => {
        before(() => cy.authLogout());
        afterEach(() => cy.authLogout());

        describe('View all users', () => {
            it('should redirect to login page', () => {
                cy.visit('/users');
                cy.url().should('include', '/login');
            });
        });

        describe('Create a user', () => {
            it('should redirect to login page', () => {
                cy.visit('/users/create');
                cy.url().should('include', '/login');
            });
        });

        describe('Update a user', () => {
            it('should redirect to login page', () => {
                cy.visit('/users/ABC123/update');
                cy.url().should('include', '/login');
            });
        });

        describe('View pending invites', () => {
            it('should redirect to login page', () => {
                cy.visit('/users/invites');
                cy.url().should('include', '/login');
            });
        });
    });
});
