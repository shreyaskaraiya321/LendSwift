/// <reference types="cypress" />

describe('Home Loan End-to-End Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('verifies mandatory Step 6 Co-Applicant inclusion and property document requirements for Home Loans', () => {
    // -------------------------------------------------------------
    // Step 1: Home Loan Selection
    // -------------------------------------------------------------
    cy.contains('Select Loan Category & Terms').should('be.visible');
    cy.fillStep1('Home', 4500000, 240, 'Ready Property Purchase');

    // Verify 8.5% p.a. interest rate badge
    cy.contains('8.5% p.a.').should('be.visible');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 2: Personal Information
    // -------------------------------------------------------------
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');
    cy.fillStep2({
      fullName: 'VIKRAM ADITYA SINGH',
      dob: '1988-04-12',
      gender: 'male',
      maritalStatus: 'married',
      fatherName: 'DEVENDRA SINGH',
      motherName: 'SAVITRI DEVI',
      mobileNumber: '9812345678',
      email: 'vikram.singh@example.com',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 3: KYC ID Verification
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
      addressLine1: 'B-204, Palm Meadows, Whitefield',
      pincode: '560001',
      residenceType: 'Owned',
      yearsAtAddress: 5,
      sameAsPermanent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 5: Employment & Income Details
    // -------------------------------------------------------------
    cy.contains('Employment & Income Assessment', { timeout: 6000 }).should('be.visible');
    cy.fillStep5({
      type: 'Salaried',
      companyName: 'Infosys Technologies Ltd',
      designation: 'Principal Consultant',
      monthlyNetSalary: '180000',
      yearsOfExperience: '12',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 6: Mandatory Co-Applicant Inclusion (Mandated for Home Loans)
    // -------------------------------------------------------------
    cy.contains('Co-Applicant & Guarantor Details', { timeout: 6000 }).should('be.visible');
    cy.contains('Co-Applicant Full Legal Name').should('be.visible');

    // Fill Co-Applicant details with distinct PAN
    cy.fillStep6({
      name: 'PRIYA VIKRAM SINGH',
      relationship: 'Spouse',
      pan: 'VWXPG9876G',
      income: '120000',
      consent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 7: Documents with Mandatory Property Documents
    // -------------------------------------------------------------
    cy.contains('Document Verification & Digital Signature', { timeout: 6000 }).should('be.visible');

    // Verify Property Documents are listed on checklist
    cy.contains('Property Documents').should('be.visible');

    // Upload required documents
    cy.uploadTestDocument('Aadhaar Card (Front)', 'aadhaar_front.jpg', 'image/jpeg');
    cy.uploadTestDocument('Aadhaar Card (Back)', 'aadhaar_back.jpg', 'image/jpeg');
    cy.uploadTestDocument('Salary Slips', 'salary_slips.pdf', 'application/pdf');
    cy.uploadTestDocument('Property Documents', 'registered_sale_deed.pdf', 'application/pdf');

    // Draw digital signature
    cy.drawSignature();
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 8: Pre-Approval Review & Regulatory Execution
    // -------------------------------------------------------------
    cy.contains('Pre-Approval Review & Regulatory Execution', { timeout: 6000 }).should('be.visible');

    // Verify Home Loan specific rate & amounts
    cy.contains('₹45,00,000').should('be.visible');
    cy.contains('240 Months').should('be.visible');
    cy.contains('8.5%').should('be.visible');

    // Verify Co-applicant details are rendered in review
    cy.contains('PRIYA VIKRAM SINGH').should('be.visible');

    // Consent and submit
    cy.checkAllStep8Consents();
    cy.contains('button', 'Submit Application').should('not.be.disabled').click();

    // Verify submission modal dialog appears
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Application Successfully Submitted!').should('be.visible');
    cy.contains('LS-').should('be.visible');
  });
});
