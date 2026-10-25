/// <reference types="cypress" />

describe('Application Autosave & Resume Session Engine', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('fills Steps 1-3, reloads the browser, verifies resume dialog appears, and confirms all inputs are preserved', () => {
    // -------------------------------------------------------------
    // Step 1: Select Loan & Set Amount
    // -------------------------------------------------------------
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.fillStep1('Personal', 450000, 36, 'Debt Consolidation');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 2: Fill Personal Information
    // -------------------------------------------------------------
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep2({
      fullName: 'SUNIL PRAKASH VERMA',
      dob: '1991-08-22',
      gender: 'male',
      maritalStatus: 'married',
      fatherName: 'PRAKASH VERMA',
      motherName: 'SARITA VERMA',
      mobileNumber: '9988776655',
      email: 'sunil.verma@example.com',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 3: Fill KYC Details & Save Draft
    // -------------------------------------------------------------
    cy.contains('Statutory KYC & Government ID Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep3({
      panNumber: 'ABCPE1234F',
      aadhaarNumber: '987654321012',
      aadhaarConsent: true,
    });

    // Explicitly click Save Draft to flush persistence storage
    cy.contains('button', 'Save Draft').click();

    // Verify draft status indicator reports draft saved
    cy.contains('Draft saved', { timeout: 4000 }).should('be.visible');

    // -------------------------------------------------------------
    // Session Interruption: Reload Browser Window
    // -------------------------------------------------------------
    cy.reload();

    // -------------------------------------------------------------
    // Verify Resume Application Accessible Modal Dialog
    // -------------------------------------------------------------
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.contains('In-Progress Application Found').should('be.visible');
    cy.contains('Resume your previous application from Step 3').should('be.visible');
    cy.contains('button', 'Resume from Step 3').should('be.visible');
    cy.contains('button', 'Start Fresh').should('be.visible');

    // Click "Resume from Step 3"
    cy.contains('button', 'Resume from Step 3').click();

    // Modal should close
    cy.contains('In-Progress Application Found').should('not.exist');

    // Verify Step 3 inputs are restored
    cy.contains('Statutory KYC & Government ID Verification').should('be.visible');
    cy.get('#panNumberInput').should('not.have.value', '');
    cy.get('#aadhaarNumberInput').should('not.have.value', '');
    cy.get('input[name="aadhaarConsent"]').should('be.checked');

    // Navigate back to Step 2 to verify Step 2 inputs were preserved
    cy.prevStep();
    cy.contains('Personal Information & Identity Verification').should('be.visible');
    cy.get('#fullName').should('have.value', 'SUNIL PRAKASH VERMA');
    cy.get('#mobileNumber').should('have.value', '9988776655');
    cy.get('#email').should('have.value', 'sunil.verma@example.com');

    // Navigate back to Step 1 to verify Step 1 inputs were preserved
    cy.prevStep();
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.get('#loanAmountInput').should('have.value', (450000).toLocaleString('en-IN'));
  });

  it('allows user to start fresh and reset all previously persisted draft state', () => {
    // Fill Step 1 and 2
    cy.fillStep1('Personal', 350000, 24);
    cy.nextStep();
    cy.fillStep2({
      fullName: 'ROHIT MEHTA',
      dob: '1993-01-10',
      mobileNumber: '9123456780',
      email: 'rohit.mehta@example.com',
    });
    cy.nextStep();

    // Explicitly click Save Draft
    cy.contains('button', 'Save Draft').click();
    cy.contains('Draft saved', { timeout: 4000 }).should('be.visible');

    // Reload browser
    cy.reload();

    // Modal appears
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');

    // Click "Start Fresh"
    cy.contains('button', 'Start Fresh').click();

    // Should return to Step 1 with default empty state
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.nextStep();

    // Step 2 full name should be empty
    cy.get('#fullName').should('have.value', '');
  });
});
