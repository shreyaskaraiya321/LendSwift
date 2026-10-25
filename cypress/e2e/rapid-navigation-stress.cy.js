/// <reference types="cypress" />

describe('Rapid Navigation & Loan Type Switching Stress Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('handles rapid clicking on Next button without double submission or state corruption', () => {
    cy.contains('Select Loan Category & Terms').should('be.visible');

    // Rapidly click the Next button 20 times to test anti-double-submission
    for (let i = 0; i < 20; i++) {
      cy.get('button[aria-label="Continue to next step"]').first().click({ force: true });
    }

    // Should cleanly transition to Step 2 without crashing or skipping past Step 2
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.contains('Step 2 of 8').should('be.visible');
  });

  it('switches loan types back and forth repeatedly without data corruption or memory leaks', () => {
    cy.contains('Select Loan Category & Terms').should('be.visible');

    // Switch between Personal, Home, and Business repeatedly
    const sequence = ['Home', 'Business', 'Personal', 'Business', 'Home', 'Personal'];

    sequence.forEach((type) => {
      cy.contains('button', `${type} Loan`).click();
      cy.contains('button', `${type} Loan`).should('have.attr', 'aria-pressed', 'true');

      if (type === 'Personal') {
        cy.contains('10.5% p.a.').should('be.visible');
        cy.get('#loanAmountInput').should('not.have.value', '0');
      } else if (type === 'Home') {
        cy.contains('8.5% p.a.').should('be.visible');
      } else if (type === 'Business') {
        cy.contains('14.0% p.a.').should('be.visible');
      }
    });

    // Verify after stress switching that final selection (Personal) is intact and can proceed
    cy.fillStep1('Personal', 350000, 36);
    cy.nextStep();

    // Successfully arrives on Step 2
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
  });

  it('rapidly alternates between Previous and Next steps without unmount crashes', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');

    // Rapidly toggle back and forth between Step 1 and Step 2
    for (let i = 0; i < 5; i++) {
      cy.prevStep();
      cy.contains('Select Loan Category & Terms').should('be.visible');
      cy.nextStep();
      cy.contains('Personal Information & Identity Verification').should('be.visible');
    }

    // Form inputs and state remain fully interactive
    cy.get('#fullName').type('STRESS TEST USER');
    cy.get('#fullName').should('have.value', 'STRESS TEST USER');
  });
});
