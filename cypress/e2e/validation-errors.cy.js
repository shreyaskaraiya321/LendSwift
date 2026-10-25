/// <reference types="cypress" />

describe('Form Validation Errors & Accessibility Alerts', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('triggers onBlur and form-level validation errors with role="alert" across steps', () => {
    // -------------------------------------------------------------
    // Step 1: Constraint & Range Validation
    // -------------------------------------------------------------
    cy.contains('Select Loan Category & Terms').should('be.visible');

    // Enter out-of-range loan amount (below min ₹50,000 for Personal Loan)
    cy.get('#loanAmountInput').clear().type('10000').blur();
    cy.nextStep();
    cy.get('[role="alert"]').should('be.visible');

    // Fix Step 1 inputs to proceed
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 2: Empty Progression & Field-level Blur Validation
    // -------------------------------------------------------------
    cy.contains('Personal Information & Identity Verification', { timeout: 6000 }).should('be.visible');

    // Attempt empty progression without filling mandatory fields
    cy.nextStep();

    // Verify role="alert" errors for full name, DOB, parental names, mobile, and email
    cy.get('[role="alert"]').should('have.length.at.least', 3);

    // Test specific field validations on blur
    cy.get('#fullName').type('A').blur(); // too short
    cy.get('[role="alert"]').should('be.visible');

    cy.get('#mobileNumber').type('12345').blur(); // invalid Indian mobile
    cy.get('[role="alert"]').should('be.visible');

    cy.get('#email').type('invalid-email-address').blur();
    cy.get('[role="alert"]').should('be.visible');

    // Fill valid Step 2 data to advance
    cy.fillStep2({
      fullName: 'ANANYA RAMESH DESHMUKH',
      dob: '1995-03-25',
      gender: 'female',
      maritalStatus: 'single',
      fatherName: 'RAMESH DESHMUKH',
      motherName: 'SUNITA DESHMUKH',
      mobileNumber: '9823456780',
      email: 'ananya.deshmukh@example.com',
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 3: PAN Entity & Aadhaar Verhoeff Algorithm Rejection
    // -------------------------------------------------------------
    cy.contains('Statutory KYC & Government ID Verification', { timeout: 6000 }).should('be.visible');

    // Invalid PAN format (too short)
    cy.get('#panNumberInput').type('ABCDE').blur();
    cy.get('[role="alert"]').should('contain.text', 'PAN');

    // Aadhaar Verhoeff checksum failure test (invalid checksum digit)
    cy.get('#aadhaarNumberInput').type('987654321013').blur();
    cy.contains('Aadhaar checksum failed', { timeout: 4000 }).should('be.visible');

    // Missing mandatory Aadhaar consent test
    cy.get('#panNumberInput').clear().type('ABCPE1234F').blur();
    cy.contains('✓ Verified', { timeout: 5000 }).should('be.visible');

    cy.get('#aadhaarNumberInput').clear().type('987654321012').blur();
    cy.contains('✓ Verified (Verhoeff Passed)', { timeout: 5000 }).should('be.visible');

    // Attempt to proceed without checking consent
    cy.get('input[type="checkbox"][name="aadhaarConsent"]').uncheck({ force: true });
    cy.nextStep();
    cy.get('[role="alert"]').should('contain.text', 'consent');

    // Check consent and advance
    cy.get('input[type="checkbox"][name="aadhaarConsent"]').check({ force: true });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 4: Residential Address & Postal Validation
    // -------------------------------------------------------------
    cy.contains('Current & Permanent Residential Address', { timeout: 6000 }).should('be.visible');

    // Empty progression attempt
    cy.nextStep();
    cy.get('[role="alert"]').should('be.visible');

    // Invalid PIN Code (< 6 digits)
    cy.get('#pincode').clear().type('123').blur();
    cy.get('[role="alert"]').should('be.visible');

    // Fill valid address to proceed
    cy.fillStep4({
      addressLine1: 'Flat 101, Green Meadows',
      pincode: '400001',
      residenceType: 'Owned',
      yearsAtAddress: 3,
      sameAsPermanent: true,
    });
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 5: Employment Minimum Income Constraints
    // -------------------------------------------------------------
    cy.contains('Employment & Income Assessment', { timeout: 6000 }).should('be.visible');

    // Salaried monthly income below minimum ₹15,000 constraint
    cy.get('#companyName').clear().type('Tech Corp');
    cy.get('#designation').clear().type('Developer');
    cy.get('#monthlyNetSalary').clear().type('8000').blur(); // below min 15k
    cy.get('#yearsOfExperience').clear().type('2');

    cy.nextStep();
    cy.get('[role="alert"]').should('be.visible');

    // Fix salary to meet statutory threshold
    cy.get('#monthlyNetSalary').clear().type('65000');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 7: Document Upload & Signature Gating
    // -------------------------------------------------------------
    cy.contains('Document Verification & Digital Signature', { timeout: 6000 }).should('be.visible');

    // Attempt to advance without mandatory signature
    cy.nextStep();
    cy.get('[role="alert"]').should('be.visible');

    // Draw signature
    cy.drawSignature();

    // Clear signature and verify error reappears on Next
    cy.contains('button', 'Clear Signature').click();
    cy.nextStep();
    cy.get('[role="alert"]').should('be.visible');

    // Re-draw signature and upload files to proceed
    cy.drawSignature();
    cy.uploadTestDocument('Aadhaar Card (Front)', 'aadhaar_front.jpg', 'image/jpeg');
    cy.uploadTestDocument('Aadhaar Card (Back)', 'aadhaar_back.jpg', 'image/jpeg');
    cy.uploadTestDocument('Salary Slips', 'salary_slips.pdf', 'application/pdf');
    cy.nextStep();

    // -------------------------------------------------------------
    // Step 8: Mandatory Consents Gating
    // -------------------------------------------------------------
    cy.contains('Pre-Approval Review & Regulatory Execution', { timeout: 6000 }).should('be.visible');

    // Final Submit button must remain disabled when consents are unchecked
    cy.contains('button', 'Submit Application').should('be.disabled');

    // Check 3 consents only (1 missing) - submit must still be disabled
    cy.get('input[name="consentInformationAccuracy"]').check({ force: true });
    cy.get('input[name="consentCreditBureau"]').check({ force: true });
    cy.get('input[name="consentTermsKfs"]').check({ force: true });
    cy.contains('button', 'Submit Application').should('be.disabled');

    // Check final 4th consent - submit button enables
    cy.get('input[name="consentRegulatoryComm"]').check({ force: true });
    cy.contains('button', 'Submit Application').should('not.be.disabled');
  });
});
