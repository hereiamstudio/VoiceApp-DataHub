import strings from '@/locales/en.json';
import {detailsSchema} from '@/schemas/project';
import projectFixtures from '../fixtures/projects.json';
import {COUNTRIES} from '@/utils/countries';

describe.only('Projects', () => {
    before(() => cy.authLogout());

    context('When not authenticated', () => {
        afterEach(() => cy.authLogout());

        describe('View all projects', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects');
                cy.url().should('include', '/login');
            });
        });

        describe('Create a project', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/create');
                cy.url().should('include', '/login');
            });
        });

        describe('Update a project', () => {
            it('should redirect to login page', () => {
                cy.visit('/projects/ABC123/update');
                cy.url().should('include', '/login');
            });
        });
    });

    context('List page', () => {
        let projectId;
        let project;

        beforeEach(() => {
            cy.intercept('/api/projects**').as('api');
            cy.loginAndSeedDB('administrator', ['projects'], '/projects');
            cy.wait('@api');

            projectId = Object.keys(projectFixtures.seed)[0];
            project = projectFixtures.seed[projectId];
        });
        afterEach(() => cy.authLogout());

        describe('Page furniture', () => {
            it('should show the page title', () => {
                cy.findByText(strings.projectsList.title).should('be.visible');
            });

            it('should allow creating a new project', () => {
                cy.findByText(strings.projectsList.create).click();
                cy.url().should('include', '/projects/create');
            });
        });

        describe('Has data', () => {
            it('should show a list of projects', () => {
                cy.findByText(project.title).should('be.visible');
            });
        });
    });

    context('Create page', () => {
        beforeEach(() => {
            cy.loginAndSeedDB('administrator', ['projects'], '/projects/create');
        });
        afterEach(() => cy.authLogout());

        describe('Page furniture', () => {
            it('should show the page title', () => {
                cy.findByText(strings.projectsCreate.title).should('be.visible');
            });

            it.skip('should show a breadcrumb nav', () => {
                cy.findByText('All projects').click();
                cy.url().should('include', '/projects');
            });

            it('should show a back button to go back to the list page', () => {
                cy.findByText('Back').click();
                cy.url().should('include', '/projects');
            });
        });

        describe('Form validation', () => {
            it('should error when title is invalid', () => {
                // empty
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.title.errors.empty).should('be.visible');
                // invalid
                cy.findByText(detailsSchema.fields.title.label).type(
                    projectFixtures.invalid.title,
                    {delay: 0}
                );
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.title.errors.maxLength).should('be.visible');
            });

            it('should error when description is invalid', () => {
                // empty
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.description.errors.empty).should('be.visible');
                // invalid
                cy.findByText(detailsSchema.fields.description.label).type(
                    projectFixtures.invalid.description,
                    {delay: 0}
                );
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.description.errors.maxLength).should(
                    'be.visible'
                );
            });

            it('should error when country is invalid', () => {
                // empty
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.location_country.errors.empty).should(
                    'be.visible'
                );
                // invalid
                cy.findByText(detailsSchema.fields.location_country.label).type(
                    projectFixtures.invalid.location_country,
                    {delay: 0}
                );
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.location_country.errors.empty).should(
                    'be.visible'
                );
            });

            it('should error when region is invalid', () => {
                // empty
                cy.findByText(strings.projectsCreate.project.submit).click();
                cy.findByText(detailsSchema.fields.location_region.errors.empty).should(
                    'be.visible'
                );
            });
        });

        describe('Successful post', () => {
            beforeEach(() => {
                cy.findByText(detailsSchema.fields.title.label).type(
                    projectFixtures.successful.title
                );
                cy.findByText(detailsSchema.fields.description.label).type(
                    projectFixtures.successful.description,
                    {delay: 0}
                );
                cy.findByText(detailsSchema.fields.location_country.label)
                    .get('select')
                    .select(projectFixtures.successful.location_country);
                cy.findByText(detailsSchema.fields.location_region.label).type(
                    projectFixtures.successful.location_region,
                    {delay: 0}
                );
                cy.findByText(detailsSchema.fields.is_active.label).click();
                cy.findByText(strings.projectsCreate.project.submit).click();
            });

            it('should redirect to the update page to add users to the project', () => {
                // TODO: Is there a way we could get the ID of the newly-created document?
                // Do we need to?
                cy.url().should('include', '/projects');
                cy.url().should('include', '/update');
            });

            it('should show a toast notification', () => {
                cy.findByText(strings.projectsCreate.project.createSuccess.title).should(
                    'be.visible'
                );
                cy.findByText(strings.projectsCreate.project.createSuccess.text).should(
                    'be.visible'
                );
            });
        });
    });

    context('Update page', () => {
        const projectId = Object.keys(projectFixtures.seed)[0];
        let project = projectFixtures.seed[projectId];

        project.location_country = COUNTRIES[project.location.country];
        project.location_region = project.location.region;

        beforeEach(() => {
            cy.intercept('/api/projects/**').as('api');
            cy.loginAndSeedDB('administrator', ['projects'], `/${projectId}/update`);
            cy.wait('@api');
        });
        afterEach(() => cy.authLogout());

        describe('Page furniture', () => {
            it('should show the page title', () => {
                cy.findByText(strings.projectsUpdate.title).should('be.visible');
            });

            it.skip('should show a breadcrumb nav', () => {
                cy.findByText('All projects').click();
                cy.url().should('include', '/projects');
            });

            it('should show a back button to go back to the list page', () => {
                cy.findByText('Back').click();
                cy.url().should('include', '/projects');
            });
        });

        describe.skip('Forms', () => {
            it('should fill out the form with the document data', () => {
                // TODO: Figure out how to test boolean fields
                const formFieldKeys = Object.keys(detailsSchema.fields).filter(
                    key => key !== 'is_active'
                );

                formFieldKeys.map(field => {
                    cy.get(`[name="${field}"]`).should($field => {
                        if ($field[0].type.includes('select')) {
                            return expect($field.find('option:selected')).to.contain(
                                project[field]
                            );
                        } else {
                            return expect($field[0].value).to.equal(project[field]);
                        }
                    });
                });
            });
        });

        describe('Successful post', () => {
            beforeEach(() => {
                cy.findByText(detailsSchema.fields.title.label).type(' updated');
                cy.findByText(strings.projectsUpdate.details.submit).click();
            });

            it('should show a toast notification', () => {
                cy.findByText(strings.projectsUpdate.details.updateSuccess.title).should(
                    'be.visible'
                );
                cy.findByText(strings.projectsUpdate.details.updateSuccess.text).should(
                    'be.visible'
                );
            });
        });
    });
});
