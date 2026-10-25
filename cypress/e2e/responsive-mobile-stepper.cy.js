/// <reference types="cypress" />

describe('Responsive Mobile & Tablet Viewport Usability', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('renders mobile layout seamlessly on iPhone SE (375 x 667)', () => {
    cy.viewport(375, 667);
    cy.visit('/');

    // Check main LendSwift branding
    cy.contains('LendSwift').should('be.visible');

    // Loan Category Cards stack into single column
    cy.contains('Personal Loan').should('be.visible');
    cy.contains('Home Loan').should('be.visible');
    cy.contains('Business Loan').should('be.visible');

    // Navigation buttons are full width and touch-accessible
    cy.get('button[aria-label="Continue to next step"]')
      .should('be.visible')
      .and('have.class', 'w-full');

    // Fill Step 1 and proceed to Step 2
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();

    // Verify Step 2 is responsive and properly padded
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.get('#fullName').should('be.visible');
  });

  it('renders tablet layout seamlessly on iPad (768 x 1024)', () => {
    cy.viewport(768, 1024);
    cy.visit('/');

    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.fillStep1('Home', 4000000, 180);
    cy.nextStep();

    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.get('#dob').should('be.visible');
  });

  it('renders accessible modal dialog properly on small viewports without horizontal overflow', () => {
    cy.viewport(375, 667);
    cy.visit('/');

    // Complete quick flow to reach Step 8 on mobile
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();
    cy.uploadTestDocument('Aadhaar Card (Front)', 'aadhaar_front.jpg', 'image/jpeg');
    cy.uploadTestDocument('Aadhaar Card (Back)', 'aadhaar_back.jpg', 'image/jpeg');
    cy.uploadTestDocument('Salary Slips', 'salary_slips.pdf', 'application/pdf');
    cy.drawSignature();
    cy.nextStep();

    // On Step 8, check consents and trigger success modal
    cy.checkAllStep8Consents();
    cy.contains('button', 'Submit Application').click();

    // Dialog is visible, constrained within viewport, and has no horizontal overflow
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Application Successfully Submitted!').should('be.visible');
  });
});
