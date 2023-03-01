describe('Templates', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        describe('View all templates', () => {
            it('should redirect to login page', () => {
                cy.visit('/templates');
                cy.url().should('include', '/login');
            });
        });

        describe('Create a template', () => {
            it('should redirect to login page', () => {
                cy.visit('/templates/create/consent');
                cy.url().should('include', '/login');
            });

            it('should redirect to login page', () => {
                cy.visit('/templates/create/question');
                cy.url().should('include', '/login');
            });

            it('should redirect to login page', () => {
                cy.visit('/templates/create/probing_question');
                cy.url().should('include', '/login');
            });
        });

        describe('Update a template', () => {
            it('should redirect to login page', () => {
                cy.visit('/templates/ABC123/update/consent');
                cy.url().should('include', '/login');
            });

            it('should redirect to login page', () => {
                cy.visit('/templates/ABC123/update/question');
                cy.url().should('include', '/login');
            });

            it('should redirect to login page', () => {
                cy.visit('/templates/ABC123/update/probing_question');
                cy.url().should('include', '/login');
            });
        });
    });
});
