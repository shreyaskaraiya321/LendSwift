/// <reference types="cypress" />

describe('Business Loan End-to-End Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes the Business Loan journey with GST validation, turnover inputs, and commercial documents', () => {
    // -------------------------------------------------------------
    // Step 1: Business Loan Category
    // -------------------------------------------------------------
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.fillStep1('Business', 1500000, 48, 'Working Capital Expansion');

    // Verify 14.0% p.a. interest rate badge
    cy.contains('14.0% p.a.').should('be.visible');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 2: Personal Information
    // -------------------------------------------------------------
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep2({
      fullName: 'ANIL SURESH DESHMUKH',
      dob: '1985-09-20',
      gender: 'male',
      maritalStatus: 'married',
      fatherName: 'SURESH DESHMUKH',
      motherName: 'USHA DESHMUKH',
      mobileNumber: '9765432109',
      email: 'anil.deshmukh@enterprises.com',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 3: Statutory KYC & Government ID
    // -------------------------------------------------------------
    cy.contains('Statutory KYC & Government ID Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep3({
      panNumber: 'ABCCE1234F',
      aadhaarNumber: '987654321012',
      aadhaarConsent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 4: Residential Address
    // -------------------------------------------------------------
    cy.contains('Current & Permanent Residential Address', { timeout: 6000 }).should('be.visible');
    cy.fillStep4({
      addressLine1: 'Plot 18, Gulmohar Enclave, Shivaji Nagar',
      pincode: '411005',
      residenceType: 'Owned',
      yearsAtAddress: 6,
      sameAsPermanent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 5: Business Owner & GSTIN Verification
    // -------------------------------------------------------------
    cy.contains('Employment & Income Assessment', { timeout: 6000 }).should('be.visible');

    // Confirm that Salaried option is disabled for Business Loan
    cy.contains('button[role="radio"]', 'Salaried').should('have.attr', 'disabled');

    // Fill Business Owner details
    cy.fillStep5({
      type: 'Business Owner',
      businessName: 'Deshmukh Precision Engineering Pvt Ltd',
      businessType: 'Private Limited Company',
      gstNumber: '27ABCDE1234F1Z5',
      businessAddress: 'Plot 45, MIDC Bhosari Industrial Area, Pune 411026',
      annualTurnover: '8500000',
      yearsInBusiness: '5',
      monthlyIncome: '220000',
    });

    // Verify GST validation badge displays State Code 27 (Maharashtra)
    cy.contains('✓ Valid GSTIN (State: 27)').should('be.visible');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 6: Step 6 Gating check (Business Loan <= 20L skips Step 6)
    // -------------------------------------------------------------
    cy.contains('Document Verification & Digital Signature', { timeout: 6000 }).should('be.visible');

    // -------------------------------------------------------------
    // Step 7: Documents with Business Registration & GST Returns
    // -------------------------------------------------------------
    cy.contains('Business Reg / GST').should('be.visible');

    cy.uploadTestDocument('Aadhaar Card (Front)', 'aadhaar_front.jpg', 'image/jpeg');
    cy.uploadTestDocument('Aadhaar Card (Back)', 'aadhaar_back.jpg', 'image/jpeg');
    cy.uploadTestDocument('Business Reg / GST', 'gst_registration_cert.pdf', 'application/pdf');

    // Draw digital signature
    cy.drawSignature();
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 8: Pre-Approval Review & Execution
    // -------------------------------------------------------------
    cy.contains('Pre-Approval Review & Regulatory Execution', { timeout: 6000 }).should('be.visible');

    // Verify 14.0% interest rate and loan amount
    cy.contains('₹15,00,000').should('be.visible');
    cy.contains('48 Months').should('be.visible');
    cy.contains('14%').should('be.visible');

    // Consent and submit
    cy.checkAllStep8Consents();
    cy.contains('button', 'Submit Application').should('not.be.disabled').click();

    // Verify submission modal dialog appears
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Application Successfully Submitted!').should('be.visible');
    cy.contains('LS-').should('be.visible');
  });
});
