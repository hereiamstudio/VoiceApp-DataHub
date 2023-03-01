describe('Questions', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        describe('View all questions', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/abc123/interviews/abc123/questions');
                cy.url().should('include', '/login');
            });
        });

        describe('Create a question', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/abc123/interviews/abc123/questions/create');
                cy.url().should('include', '/login');
            });
        });

        describe('Update a question', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/abc123/interviews/abc123/questions/ABC123/update');
                cy.url().should('include', '/login');
            });
        });
    });
});
