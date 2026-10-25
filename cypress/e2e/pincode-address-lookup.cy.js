/// <reference types="cypress" />

describe('Postal PIN Code Auto-Lookup & Residential Address Logic', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    // Fast-track to Step 4
    cy.fillStep1('Personal', 300000, 36);
    cy.nextStep();
    cy.fillStep2();
    cy.nextStep();
    cy.fillStep3();
    cy.nextStep();
  });

  it('automatically detects city and state from Indian postal PIN codes', () => {
    cy.contains('Current & Permanent Residential Address').should('be.visible');

    // 1. Enter Mumbai PIN Code
    cy.get('#pincode').clear().type('400001');
    cy.get('#city', { timeout: 4000 }).should('have.value', 'Mumbai');
    cy.get('#state').should('have.value', 'Maharashtra');
    cy.contains('✓ Mumbai, Maharashtra').should('be.visible');

    // 2. Enter Bengaluru PIN Code
    cy.get('#pincode').clear().type('560001');
    cy.get('#city', { timeout: 4000 }).should('match', /Bengaluru|Bangalore/i);
    cy.get('#state').should('have.value', 'Karnataka');

    // 3. Enter New Delhi PIN Code
    cy.get('#pincode').clear().type('110001');
    cy.get('#city', { timeout: 4000 }).should('contain.value', 'Delhi');
    cy.get('#state').should('have.value', 'Delhi');
  });

  it('toggles conditional rent input and previous address stability fields dynamically', () => {
    cy.contains('Current & Permanent Residential Address').should('be.visible');

    // 1. When residence type is 'Owned', rent field should not exist
    cy.get('#residenceType').select('Owned');
    cy.get('#monthlyRentAmount').should('not.exist');

    // 2. When changed to 'Rented', rent field appears
    cy.get('#residenceType').select('Rented');
    cy.get('#monthlyRentAmount').should('be.visible');
    cy.get('#monthlyRentAmount').clear().type('22000');
    cy.get('#monthlyRentAmount').should('have.value', '22000');

    // 3. When yearsAtAddress >= 1, previous address field should not exist
    cy.get('#yearsAtAddress').clear().type('3');
    cy.get('#previousAddressLine').should('not.exist');

    // 4. When yearsAtAddress < 1 (e.g. 0.5), stability previous address field appears
    cy.get('#yearsAtAddress').clear().type('0.5');
    cy.get('#previousAddressLine').should('be.visible');
    cy.contains('Stability Check < 1 Year').should('be.visible');
    cy.get('#previousAddressLine').type('Previous Flat 12, Park View, Pune 411001');
  });

  it('copies current address to permanent address when "Same as Permanent" is toggled', () => {
    cy.contains('Current & Permanent Residential Address').should('be.visible');

    cy.get('#currentAddressLine1').clear().type('Flat 302, Lake View Towers');
    cy.get('#pincode').clear().type('110001');

    // Default: "Same as Permanent" is checked
    cy.get('input[name="sameAsPermanent"]').should('be.checked');

    // Uncheck "Same as Permanent"
    cy.get('input[name="sameAsPermanent"]').uncheck({ force: true });

    // Permanent address sub-form appears
    cy.get('#permanentAddressLine1').should('be.visible');
    cy.get('#permanentPincode').should('be.visible');

    // Enter distinct permanent address
    cy.get('#permanentAddressLine1').type('Ancestral Home, Station Road');
    cy.get('#permanentPincode').type('400001');
    cy.get('#permanentCity', { timeout: 4000 }).should('have.value', 'Mumbai');

    // Re-check "Same as Permanent" -> permanent subfields hide
    cy.get('input[name="sameAsPermanent"]').check({ force: true });
    cy.get('#permanentAddressLine1').should('not.exist');
  });
});
