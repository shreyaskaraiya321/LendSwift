/// <reference types="cypress" />

describe('Automated WCAG 2.1 AA Accessibility Audit across all 8 Steps', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.injectAxe();
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 1: Category & Terms', () => {
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 2: Personal Information', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();

    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 3: Statutory KYC & ID Verification', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();

    cy.contains('Statutory KYC & Government ID Verification', { timeout: 6000 }).should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 4: Residential Address & Postal Lookup', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();

    cy.contains('Current & Permanent Residential Address', { timeout: 6000 }).should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 5: Employment & Income Assessment', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();

    cy.contains('Employment & Income Assessment', { timeout: 6000 }).should('be.visible');

    // Test Salaried
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious', 'moderate'] });

    // Test Self-Employed
    cy.contains('button[role="radio"]', 'Self-Employed').click();
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious', 'moderate'] });

    // Test Business Owner
    cy.contains('button[role="radio"]', 'Business Owner').click();
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious', 'moderate'] });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 6: Co-Applicant & Guarantor Details', () => {
    // Select Home loan so Step 6 is visible
    cy.fillStep1('Home', 3500000, 180);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
    cy.fillStep4();
    cy.nextStep();
    cy.fillStep5({ type: 'Salaried' });
    cy.nextStep();

    cy.contains('Co-Applicant & Guarantor Details', { timeout: 6000 }).should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 7: Documents & Digital Signature', () => {
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

    cy.contains('Document Verification & Digital Signature', { timeout: 6000 }).should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });

  it('passes WCAG 2.1 AA accessibility checks on Step 8: Pre-Approval KFS Review & Regulatory Consents', () => {
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

    cy.contains('Pre-Approval Review & Regulatory Execution', { timeout: 6000 }).should('be.visible');
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });

    // Check modal dialog accessibility
    cy.checkAllStep8Consents();
    cy.contains('button', 'Submit Application').click();
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.checkA11y('div[role="dialog"]', {
      includedImpacts: ['critical', 'serious', 'moderate'],
    });
  });
});
