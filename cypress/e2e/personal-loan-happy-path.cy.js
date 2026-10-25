/// <reference types="cypress" />

describe('Personal Loan End-to-End Happy Path', () => {
  beforeEach(() => {
    // Clear localStorage to ensure fresh application session
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes the entire personal loan journey with salaried details, document attachment, signature, and submission', () => {
    // -------------------------------------------------------------
    // Step 1: Loan Type & Terms Selection
    // -------------------------------------------------------------
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.fillStep1('Personal', 300000, 36, 'Debt Consolidation');

    // Verify rate badge and computed values
    cy.contains('10.5% p.a.').should('be.visible');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 2: Personal Information & Contact Details
    // -------------------------------------------------------------
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep2({
      fullName: 'RAJESH KUMAR SHARMA',
      dob: '1992-06-15',
      gender: 'male',
      maritalStatus: 'married',
      fatherName: 'RAMESH SHARMA',
      motherName: 'SUNITA SHARMA',
      mobileNumber: '9876543210',
      email: 'rajesh.sharma@example.com',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 3: Statutory KYC & Government ID Validation
    // -------------------------------------------------------------
    cy.contains('Statutory KYC & Government ID Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep3({
      panNumber: 'ABCPE1234F',
      aadhaarNumber: '987654321012',
      aadhaarConsent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 4: Residential Address
    // -------------------------------------------------------------
    cy.contains('Current & Permanent Residential Address', { timeout: 6000 }).should('be.visible');
    cy.fillStep4({
      addressLine1: 'Flat 402, Shivalik Heights, MG Road',
      addressLine2: 'Near Central Mall',
      pincode: '110001',
      residenceType: 'Owned',
      yearsAtAddress: 4,
      sameAsPermanent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 5: Salaried Employment
    // -------------------------------------------------------------
    cy.contains('Employment & Income Assessment', { timeout: 6000 }).should('be.visible');
    cy.fillStep5({
      type: 'Salaried',
      companyName: 'Tata Consultancy Services',
      designation: 'Senior Lead Engineer',
      monthlyNetSalary: '95000',
      yearsOfExperience: '7',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 6: Step 6 Gating check (Personal Loan <= 5L skips Step 6)
    // -------------------------------------------------------------
    // For Personal Loan <= ₹5L, Step 6 is skipped automatically and advances to Step 7
    cy.contains('Document Verification & Digital Signature', { timeout: 6000 }).should('be.visible');

    // -------------------------------------------------------------
    // Step 7: Documents & Digital Signature
    // -------------------------------------------------------------
    cy.uploadTestDocument('Aadhaar Card (Front)', 'aadhaar_front.jpg', 'image/jpeg');
    cy.uploadTestDocument('Aadhaar Card (Back)', 'aadhaar_back.jpg', 'image/jpeg');
    cy.uploadTestDocument('Salary Slips', 'salary_slips_q3.pdf', 'application/pdf');

    // Draw digital signature on canvas
    cy.drawSignature();
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 8: Pre-Approval Review, Consents & Final Execution
    // -------------------------------------------------------------
    cy.contains('Pre-Approval Review & Regulatory Execution', { timeout: 6000 }).should('be.visible');

    // Verify live KFS summary card
    cy.contains('Key Fact Statement (KFS) Pre-Approval Sanction').should('be.visible');
    cy.contains('₹3,00,000').should('be.visible');
    cy.contains('36 Months').should('be.visible');

    // Verify captured digital e-signature image is rendered in review
    cy.get('img[alt="Captured Borrower Digital E-Signature"]').should('be.visible');

    // Check all 4 mandatory regulatory consents
    cy.checkAllStep8Consents();

    // Submit Application button should now be enabled
    cy.contains('button', 'Submit Application').should('not.be.disabled').click();

    // Verify submission modal dialog appears with reference number
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Application Successfully Submitted!').should('be.visible');
    cy.contains('Application Reference Number').should('be.visible');
    cy.contains('LS-').should('be.visible');
  });
});
