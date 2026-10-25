/// <reference types="cypress" />

describe('Real-Time EMI Calculator & Financial Terms Sync', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('synchronizes slider and numeric input bidirectionally for loan amount and tenure', () => {
    cy.contains('Select Loan Category & Terms').should('be.visible');

    // 1. Change Amount via numeric input and check slider attribute
    cy.get('#loanAmountInput')
      .clear()
      .type('500000');

    cy.get('#loanAmountSlider').should('have.value', '500000');

    // 2. Change Tenure via numeric input and check slider attribute
    cy.get('#loanTenureInput')
      .clear()
      .type('48');

    cy.get('#loanTenureSlider').should('have.value', '48');

    // 3. Move Amount Slider and verify numeric input updates
    cy.get('#loanAmountSlider')
      .invoke('val', 600000)
      .trigger('change');

    cy.get('#loanAmountInput').should('have.value', (600000).toLocaleString('en-IN'));

    // 4. Move Tenure Slider and verify numeric input updates
    cy.get('#loanTenureSlider')
      .invoke('val', 24)
      .trigger('change');

    cy.get('#loanTenureInput').should('have.value', '24');
  });

  it('computes reducing-balance EMI dynamically across Personal, Home, and Business interest rates', () => {
    // Personal Loan: 10.5% p.a.
    cy.fillStep1('Personal', 500000, 36);
    cy.contains('10.5% p.a.').should('be.visible');
    // EMI for ₹5L at 10.5% for 36 months = ~₹16,252
    cy.contains('Estimated EMI').should('be.visible');
    cy.contains('₹16,252').should('be.visible');

    // Switch to Home Loan: 8.5% p.a.
    cy.contains('button', 'Home Loan').click();
    cy.contains('8.5% p.a.').should('be.visible');
    cy.fillStep1('Home', 2500000, 180); // ₹25L at 8.5% for 180 months = ~₹24,621
    cy.contains('₹24,621').should('be.visible');

    // Switch to Business Loan: 14.0% p.a.
    cy.contains('button', 'Business Loan').click();
    cy.contains('14.0% p.a.').should('be.visible');
    cy.fillStep1('Business', 1000000, 36); // ₹10L at 14.0% for 36 months = ~₹34,178
    cy.contains('₹34,178').should('be.visible');
  });

  it('clamps processing fees between minimum ₹2,000 and maximum ₹25,000', () => {
    // 1. Small loan: ₹1,00,000 -> 1% is ₹1,000, but clamped to minimum ₹2,000
    cy.fillStep1('Personal', 100000, 12);
    cy.contains('₹2,000').should('be.visible');

    // 2. Large loan: ₹50,00,000 -> 1% is ₹50,000, but clamped to maximum ₹25,000
    cy.contains('button', 'Home Loan').click();
    cy.fillStep1('Home', 5000000, 120);
    cy.contains('₹25,000').should('be.visible');
  });
});
