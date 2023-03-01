describe('Interviews', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        describe('View all interviews', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/abc123/interviews');
                cy.url().should('include', '/login');
            });
        });

        describe('Create a interview', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/abc123/interviews/create');
                cy.url().should('include', '/login');
            });
        });

        describe('Update a interview', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/abc123/interviews/ABC123/update');
                cy.url().should('include', '/login');
            });
        });
    });
});
