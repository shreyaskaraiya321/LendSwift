/// <reference types="cypress" />

describe('Step 6 Co-Applicant Conditional Visibility & Gating Engine', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('skips Step 6 for Personal Loans under ₹5,00,000 threshold and advances directly to Step 7', () => {
    cy.fillStep1('Personal', 400000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();

    // Must jump directly to Step 7 (Document Verification)
    cy.contains('Document Verification & Digital Signature', { timeout: 6000 }).should('be.visible');
    cy.contains('Co-Applicant & Guarantor Details').should('not.exist');
  });

  it('mandates Step 6 for Personal Loans strictly exceeding ₹5,00,000 threshold', () => {
    cy.fillStep1('Personal', 750000, 48); // > 5L
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();

    // Step 6 MUST be visible
    cy.contains('Co-Applicant & Guarantor Details', { timeout: 6000 }).should('be.visible');
    cy.contains('Co-Applicant Full Legal Name').should('be.visible');
  });

  it('mandates Step 6 for all Home Loans regardless of loan amount', () => {
    cy.fillStep1('Home', 1500000, 120); // Even at minimum ₹15L
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();

    // Step 6 MUST be visible for Home Loan
    cy.contains('Co-Applicant & Guarantor Details', { timeout: 6000 }).should('be.visible');
  });

  it('rejects co-applicant PAN if it is identical to primary applicant PAN', () => {
    cy.fillStep1('Home', 2500000, 180);
    cy.nextStep();
    cy.fillStep2({ maritalStatus: 'married' });
    cy.nextStep();
    cy.fillStep3({ panNumber: 'ABCPE1234F' });
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();

    cy.contains('Co-Applicant & Guarantor Details', { timeout: 6000 }).should('be.visible');

    // Auto-selection badge for Married status
    cy.contains('Auto-Selected (Married)').should('be.visible');

    // Enter identical PAN as primary applicant
    cy.get('#coApplicantName').type('SPOUSE APPLICANT');
    cy.get('#coApplicantPan').type('ABCPE1234F').blur();

    // Verify error message
    cy.contains('Co-applicant PAN cannot be identical to primary applicant PAN', { timeout: 4000 }).should('be.visible');
  });
});
