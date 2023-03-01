import strings from '@/locales/en.json';
import userFixtures from '../fixtures/users.json';
import loginSchema from '@/schemas/login';

describe('Login', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        it('should show the log in form', () => {
            cy.visit('/login');
            cy.findByText(loginSchema.fields.email.label).should('be.visible');
            cy.findByText(loginSchema.fields.password.label).should('be.visible');
            cy.findByText('Forgot your password?').should('be.visible');
            cy.findByText('Submit').should('be.visible');
        });

        describe('Form validation', () => {
            it('should error when email is invalid', () => {
                cy.visit('/login');
                // empty
                cy.findByText('Submit').click();
                cy.findByText(loginSchema.fields.email.errors.empty).should('be.visible');
                // invalid
                cy.findByText(loginSchema.fields.email.label).type('invalid');
                cy.findByText('Submit').click();
                cy.findByText(loginSchema.fields.email.errors.empty).should('be.visible');
            });

            it('should error when password is invalid', () => {
                cy.visit('/login');
                // empty
                cy.findByText('Submit').click();
                cy.findByText(loginSchema.fields.password.errors.empty).should('be.visible');
                // invalid
                cy.findByText(loginSchema.fields.password.label).type('invalid');
                cy.findByText('Submit').click();
                cy.findByText(loginSchema.fields.password.errors.empty).should('be.visible');
            });

            it('should error when details are not recognised', () => {
                cy.visit('/login');
                cy.findByText(loginSchema.fields.email.label).type('test@domain.com');
                cy.findByText(loginSchema.fields.password.label).type('randompassword');
                cy.findByText('Submit').click();
                cy.findByText(strings.generic.formError).should('be.visible');
            });

            // it.only('should error when details are not correct', () => {
            //     cy.visit('/login');
            //     cy.findByText(loginSchema.fields.email.label).type(
            //         Cypress.env('ASSESSMENT_LEAD_EMAIL')
            //     );
            //     cy.findByText(loginSchema.fields.password.label).type(
            //         Cypress.env('ASSESSMENT_LEAD_PASSWORD')
            //     );
            //     cy.findByText('Submit').click();
            //     cy.findByText(loginSchema.fields.password.errors['auth/wrong-password']).should(
            //         'be.visible'
            //     );
            // });
        });

        describe('Form post', () => {
            it('should post when form is valid', () => {
                cy.visit('/login');
                cy.findByText(loginSchema.fields.email.label).type('test@domain.com');
                cy.findByText(loginSchema.fields.password.label).type('randompassword');
                cy.findByText('Submit').click();
            });
        });
    });

    context('Should not allow enumerators to login', () => {
        beforeEach(() => cy.seedDb(['users']));
        afterEach(() => cy.authLogout());

        it('should not allow enumerators to login', () => {
            cy.visit('/login');
            cy.findByText(loginSchema.fields.email.label).type(Cypress.env('ENUMERATOR_EMAIL'));
            cy.findByText(loginSchema.fields.password.label).type(
                Cypress.env('ENUMERATOR_PASSWORD')
            );
            cy.findByText('Submit').click();
            cy.url().should('include', '/login');
        });
    });

    context('When authenticated', () => {
        beforeEach(() => cy.loginAndSeedDB('administrator', [], '/projects'));
        afterEach(() => cy.authLogout());

        it('should redirect to projects page for permitted users', () => {
            cy.url().should('include', '/projects');
        });
    });
});
