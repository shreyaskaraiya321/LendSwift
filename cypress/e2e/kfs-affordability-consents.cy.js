/// <reference types="cypress" />

describe('Step 8 Key Fact Statement (KFS), Affordability Meter & Consents', () => {
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
    cy.fillStep5({ type: 'Salaried', monthlyNetSalary: '90000' });
    cy.nextStep();
    cy.uploadTestDocument('Aadhaar Card (Front)', 'aadhaar_front.jpg', 'image/jpeg');
    cy.uploadTestDocument('Aadhaar Card (Back)', 'aadhaar_back.jpg', 'image/jpeg');
    cy.uploadTestDocument('Salary Slips', 'salary_slips.pdf', 'application/pdf');
    cy.drawSignature();
    cy.nextStep();
  });

  it('renders the complete RBI Key Fact Statement card and computes financial breakdown', () => {
    cy.contains('Pre-Approval Review & Regulatory Execution').should('be.visible');

    // Key Fact Statement Annexure A
    cy.contains('Key Fact Statement (KFS) Pre-Approval Sanction').should('be.visible');
    cy.contains('₹3,00,000').should('be.visible');
    cy.contains('36 Months').should('be.visible');
    cy.contains('10.5%').should('be.visible');
    cy.contains('Estimated EMI').should('be.visible');
    cy.contains('Total Interest').should('be.visible');
    cy.contains('Processing Fee').should('be.visible');
  });

  it('evaluates applicant debt-to-income (FOIR) with live Affordability Meter', () => {
    cy.contains('Pre-Approval Review & Regulatory Execution').should('be.visible');

    // With ₹90,000 monthly income and ~₹9,752 EMI, DTI is ~11% -> Healthy Affordability
    cy.contains('Healthy Affordability').should('be.visible');
  });

  it('supports granular accordion review expansion and smooth navigation via Edit buttons', () => {
    cy.contains('Pre-Approval Review & Regulatory Execution').should('be.visible');

    // Expand personal information accordion
    cy.contains('Personal Information & Contact Particulars').click();
    cy.contains('RAJESH KUMAR SHARMA').should('be.visible');

    // Click Edit on Step 2
    cy.contains('button', 'Edit').first().click();

    // Successfully navigated back to Step 2
    cy.contains('Personal Information & Identity Verification').should('be.visible');
    cy.get('#fullName').should('have.value', 'RAJESH KUMAR SHARMA');
  });

  it('strictly enforces all 4 independent, unchecked mandatory RBI consents before contract execution', () => {
    cy.contains('Pre-Approval Review & Regulatory Execution').should('be.visible');

    // Verify all 4 consents are initially unchecked (no pre-checked boxes allowed)
    cy.get('input[name="consentInformationAccuracy"]').should('not.be.checked');
    cy.get('input[name="consentCreditBureau"]').should('not.be.checked');
    cy.get('input[name="consentTermsKfs"]').should('not.be.checked');
    cy.get('input[name="consentRegulatoryComm"]').should('not.be.checked');

    // Submit button is disabled
    cy.contains('button', 'Submit Application').should('be.disabled');

    // Checking all 4 enables submit button
    cy.checkAllStep8Consents();
    cy.contains('button', 'Submit Application').should('not.be.disabled').click();

    // Verify modal appears and contains reference ID and copy action
    cy.get('div[role="dialog"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Application Successfully Submitted!').should('be.visible');
    cy.contains('LS-').should('be.visible');
    cy.contains('button', 'Copy ID').should('be.visible');
  });
});
