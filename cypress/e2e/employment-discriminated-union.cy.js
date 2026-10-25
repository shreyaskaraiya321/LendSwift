/// <reference types="cypress" />

describe('Step 5 Employment Discriminated Union & Form Sanitization', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
  });

  it('renders distinct fields for Salaried, Self-Employed, and Business Owner categories', () => {
    cy.contains('Employment & Income Assessment').should('be.visible');

    // 1. Salaried Branch
    cy.contains('button[role="radio"]', 'Salaried').click();
    cy.get('#companyName').should('be.visible');
    cy.get('#designation').should('be.visible');
    cy.get('#monthlyNetSalary').should('be.visible');
    cy.get('#yearsOfExperience').should('be.visible');

    // Business fields must not exist
    cy.get('#gstNumber').should('not.exist');
    cy.get('#annualTurnover').should('not.exist');

    // 2. Self-Employed Branch
    cy.contains('button[role="radio"]', 'Self-Employed').click();
    cy.get('#businessName').should('be.visible');
    cy.get('#businessType').should('be.visible');
    cy.get('#annualTurnover').should('be.visible');
    cy.get('#yearsInBusiness').should('be.visible');
    cy.get('#monthlyIncome').should('be.visible');

    // Salaried fields must not exist
    cy.get('#companyName').should('not.exist');
    cy.get('#monthlyNetSalary').should('not.exist');

    // 3. Business Owner Branch
    cy.contains('button[role="radio"]', 'Business Owner').click();
    cy.get('#businessNameOwner').should('be.visible');
    cy.get('#gstNumber').should('be.visible');
    cy.get('#businessAddress').should('be.visible');
    cy.get('#annualTurnoverOwner').should('be.visible');
  });

  it('purges obsolete fields when switching employment types to prevent stale data leakage', () => {
    cy.contains('Employment & Income Assessment').should('be.visible');

    // Fill salaried data
    cy.contains('button[role="radio"]', 'Salaried').click();
    cy.get('#companyName').type('Wipro Limited');
    cy.get('#designation').type('Tech Lead');
    cy.get('#monthlyNetSalary').type('85000');
    cy.get('#yearsOfExperience').type('5');

    // Switch to Self-Employed
    cy.contains('button[role="radio"]', 'Self-Employed').click();

    // Switch back to Salaried and verify fields were sanitized
    cy.contains('button[role="radio"]', 'Salaried').click();
    cy.get('#companyName').should('have.value', '');
    cy.get('#monthlyNetSalary').should('have.value', '');
  });

  it('validates 15-character GSTIN structure with state code and check digit for Business Owner', () => {
    cy.contains('Employment & Income Assessment').should('be.visible');

    cy.contains('button[role="radio"]', 'Business Owner').click();

    // Invalid GSTIN (wrong length or format)
    cy.get('#gstNumber').type('INVALIDGST').blur();
    cy.contains('✓ Valid GSTIN').should('not.exist');

    // Valid Maharashtra GSTIN (State 27)
    cy.get('#gstNumber').clear().type('27ABCDE1234F1Z5');
    cy.contains('✓ Valid GSTIN (State: 27)', { timeout: 3000 }).should('be.visible');
  });
});
