/// <reference types="cypress" />

describe('Accessible Keyboard-Only Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('navigates through steps using keyboard tab, enter, and space keys without pointer clicks', () => {
    // -------------------------------------------------------------
    // Step 1: Keyboard Category Selection & Continue
    // -------------------------------------------------------------
    cy.contains('Select Loan Category & Terms').should('be.visible');

    // Focus the Personal Loan category button and press Space / Enter to activate
    cy.contains('button', 'Personal Loan').focus().type('{enter}');
    cy.contains('button', 'Personal Loan').should('have.attr', 'aria-pressed', 'true');

    // Focus loan amount input, adjust value via keyboard
    cy.get('#loanAmountInput')
      .focus()
      .clear()
      .type('400000');

    // Focus Continue button and press Enter
    cy.get('button[aria-label="Continue to next step"]')
      .focus()
      .type('{enter}');

    // -------------------------------------------------------------
    // Step 2: Automatic Focus Transition & Keyboard Input
    // -------------------------------------------------------------
    // Verify focus automatically transitions to the first input (#fullName)
    cy.focused({ timeout: 5000 }).should('have.id', 'fullName');

    // Type full name
    cy.focused().type('ARJUN SANJEEV KAPOOR');

    // Tab to Date of Birth
    cy.focused().tab().type('1990-11-20');

    // Tab to Gender
    cy.focused().tab().select('male');

    // Tab to Marital Status
    cy.focused().tab().select('single');

    // Tab to Father's Name
    cy.focused().tab().type('SANJEEV KAPOOR');

    // Tab to Mother's Name
    cy.focused().tab().type('NEENA KAPOOR');

    // Fill primary mobile and email
    cy.get('#mobileNumber').focus().type('9876501234');
    cy.get('#email').focus().type('arjun.kapoor@example.com');

    // Focus Next button via keyboard and press Enter
    cy.get('button[aria-label="Continue to next step"]')
      .focus()
      .type('{enter}');

    // -------------------------------------------------------------
    // Step 3: Focus Transition to Step 3 First Input
    // -------------------------------------------------------------
    cy.contains('Statutory KYC & Government ID Verification', { timeout: 6000 }).should('be.visible');
    cy.focused().should('have.id', 'panNumberInput');

    // Type PAN and blur via tab
    cy.focused().type('ABCPE1234F').tab();
    cy.contains('✓ Verified', { timeout: 5000 }).should('be.visible');

    // Type Aadhaar and blur
    cy.get('#aadhaarNumberInput').focus().type('987654321012').tab();
    cy.contains('✓ Verified (Verhoeff Passed)', { timeout: 5000 }).should('be.visible');

    // Check Aadhaar consent checkbox using spacebar
    cy.get('input[type="checkbox"][name="aadhaarConsent"]').focus().type(' ');
    cy.get('input[type="checkbox"][name="aadhaarConsent"]').should('be.checked');

    // Tab to Next button and trigger via Enter
    cy.get('button[aria-label="Continue to next step"]')
      .focus()
      .type('{enter}');

    // -------------------------------------------------------------
    // Step 4: Address View Mounted & Keyboard Verified
    // -------------------------------------------------------------
    cy.contains('Current & Permanent Residential Address', { timeout: 6000 }).should('be.visible');
    cy.focused().should('have.id', 'currentAddressLine1');
  });
});
