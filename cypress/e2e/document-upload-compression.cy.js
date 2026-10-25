/// <reference types="cypress" />

describe('Step 7 Document Uploads, Compression & Digital Signature', () => {
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
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();
  });

  it('renders dynamic document checklist for Salaried Personal Loan and handles file attachments', () => {
    cy.contains('Document Verification & Digital Signature').should('be.visible');

    // Checklist includes Aadhaar Front, Aadhaar Back, and Salary Slips
    cy.contains('Aadhaar Card (Front)').should('be.visible');
    cy.contains('Aadhaar Card (Back)').should('be.visible');
    cy.contains('Salary Slips').should('be.visible');

    // Attach PDF document
    cy.uploadTestDocument('Salary Slips', 'march_salary_slip.pdf', 'application/pdf');

    // Verify uploaded card displays file name and remove action button
    cy.contains('march_salary_slip.pdf').should('be.visible');
    cy.get('button[aria-label*="Remove uploaded document"]').should('be.visible');
  });

  it('allows user to remove and replace an uploaded document', () => {
    cy.contains('Document Verification & Digital Signature').should('be.visible');

    cy.uploadTestDocument('Salary Slips', 'temp_slip.pdf', 'application/pdf');
    cy.contains('temp_slip.pdf').should('be.visible');

    // Click remove button
    cy.get('button[aria-label*="Remove uploaded document Salary Slips"]').click();

    // File name is removed and upload dropzone reappears
    cy.contains('temp_slip.pdf').should('not.exist');
    cy.contains('Click to upload').should('be.visible');
  });

  it('captures, clears, and validates digital borrower e-signature', () => {
    cy.contains('Document Verification & Digital Signature').should('be.visible');

    // Initially pending signature
    cy.contains('Pending Signature').should('be.visible');

    // Draw signature
    cy.drawSignature();
    cy.contains('✓ Signature Captured').should('be.visible');

    // Clear signature
    cy.contains('button', 'Clear Signature').click();
    cy.contains('Pending Signature').should('be.visible');

    // Re-draw signature to confirm state recovery
    cy.drawSignature();
    cy.contains('✓ Signature Captured').should('be.visible');
  });
});
