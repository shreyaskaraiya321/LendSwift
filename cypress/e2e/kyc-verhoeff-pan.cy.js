/// <reference types="cypress" />

describe('Statutory KYC Verification - PAN & Verhoeff Checksum Algorithm', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('strictly validates PAN 4th character entity type across Personal and Business loans', () => {
    // Navigate to Step 3 for Personal Loan
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();

    cy.contains('Statutory KYC & Government ID Verification').should('be.visible');

    // 1. Enter PAN with 4th character 'D' on Personal Loan (fails Individual requirement)
    cy.get('#panNumberInput').clear().type('ABCDE1234F').blur();
    cy.contains('Personal and Home loans require an Individual PAN', { timeout: 5000 }).should('be.visible');
    cy.contains('✓ Verified').should('not.exist');

    // 2. Enter PAN with 4th character 'P' on Personal Loan (passes)
    cy.get('#panNumberInput').clear().type('ABCPE1234F').blur();
    cy.contains('✓ Verified (Individual PAN)', { timeout: 5000 }).should('be.visible');

    // 3. Navigate back to Step 1 and switch to Business Loan
    cy.prevStep();
    cy.prevStep();
    cy.fillStep1('Business', 1000000, 36);
    cy.nextStep();
    cy.nextStep();

    // 4. On Business Loan, Company PAN ('C') and Partnership Firm PAN ('F') are valid
    cy.get('#panNumberInput').clear().type('ABCCE1234F').blur();
    cy.contains('✓ Verified (Company PAN)', { timeout: 5000 }).should('be.visible');

    cy.get('#panNumberInput').clear().type('ABCFE1234F').blur();
    cy.contains('✓ Verified (Partnership Firm PAN)', { timeout: 5000 }).should('be.visible');
  });

  it('evaluates Aadhaar 12-digit numbers strictly with UIDAI Verhoeff D5 dihedral checksum algorithm', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();

    cy.contains('Statutory KYC & Government ID Verification').should('be.visible');

    // 1. Enter invalid 12-digit Aadhaar number with incorrect checksum digit
    cy.get('#aadhaarNumberInput').clear().type('987654321013').blur();
    cy.contains('Aadhaar checksum failed. Please verify the 12 digits.', { timeout: 5000 }).should('be.visible');
    cy.contains('✓ Verified (Verhoeff Passed)').should('not.exist');

    // 2. Enter valid 12-digit Aadhaar number that satisfies Verhoeff D5 dihedral checksum
    cy.get('#aadhaarNumberInput').clear().type('987654321012').blur();
    cy.contains('✓ Verified (Verhoeff Passed)', { timeout: 5000 }).should('be.visible');

    // 3. Test Masking toggles for PAN and Aadhaar
    cy.contains('button', 'Mask').should('be.visible').click();
    cy.get('#aadhaarNumberInput').should('contain.value', '••••');
    cy.contains('button', 'Show').should('be.visible').click();
    cy.get('#aadhaarNumberInput').should('contain.value', '987654321012');
  });

  it('gates advancement to Step 4 until both PAN and Aadhaar pass verification', () => {
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();

    // Attempt to proceed without verifying
    cy.nextStep();
    cy.contains('Statutory KYC & Government ID Verification').should('be.visible');
    cy.contains('Mandatory Identity Gating').should('be.visible');

    // Verify PAN only
    cy.get('#panNumberInput').clear().type('ABCPE1234F').blur();
    cy.contains('✓ Verified (Individual PAN)', { timeout: 5000 }).should('be.visible');
    cy.nextStep();
    // Still on Step 3
    cy.contains('Statutory KYC & Government ID Verification').should('be.visible');

    // Verify Aadhaar only
    cy.get('#aadhaarNumberInput').clear().type('987654321012').blur();
    cy.contains('✓ Verified (Verhoeff Passed)', { timeout: 5000 }).should('be.visible');
    cy.get('input[type="checkbox"][name="aadhaarConsent"]').check({ force: true });

    // Now both are verified -> advance to Step 4
    cy.nextStep();
    cy.contains('Current & Permanent Residential Address', { timeout: 6000 }).should('be.visible');
  });
});
