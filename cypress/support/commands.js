// ***********************************************************
// LendSwift Custom Cypress Commands & Accessibility Testing
// ***********************************************************

/**
 * Injects axe-core runtime into the browser window for automated accessibility audits
 */
Cypress.Commands.add('injectAxe', () => {
  cy.readFile('node_modules/axe-core/axe.min.js').then((axeScript) => {
    cy.window({ log: false }).then((win) => {
      win.eval(axeScript);
    });
  });
});

/**
 * Runs axe accessibility checks against the active DOM context
 * @param {string|Element} [context]
 * @param {Object} [options]
 * @param {Function} [violationCallback]
 * @param {boolean} [skipFailures]
 */
Cypress.Commands.add('checkA11y', (context, options, violationCallback, skipFailures = false) => {
  cy.window({ log: false })
    .then((win) => {
      if (!win.axe) {
        throw new Error('Axe not injected! Call cy.injectAxe() first.');
      }
      return win.axe.run(context || win.document, options || {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      });
    })
    .then(({ violations }) => {
      if (violations.length) {
        if (violationCallback) {
          violationCallback(violations);
        }
        Cypress.log({
          name: 'a11y violation',
          message: `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} detected`,
          consoleProps: () => ({ violations }),
        });
        if (!skipFailures) {
          const formatted = violations.map(({ id, impact, description, nodes }) => ({
            id,
            impact,
            description,
            nodes: nodes.length,
          }));
          assert.fail(`${violations.length} accessibility violation(s) detected: ${JSON.stringify(formatted, null, 2)}`);
        }
      }
    });
});

/**
 * Step 1: Select Loan Category & Loan Terms
 * @param {string} loanType - 'Personal' | 'Home' | 'Business'
 * @param {number} [amount] - Required loan amount in INR
 * @param {number} [tenure] - Loan tenure in months
 * @param {string} [purpose] - Optional specific purpose string
 */
Cypress.Commands.add('fillStep1', (loanType = 'Personal', amount, tenure, purpose) => {
  cy.log(`Filling Step 1: ${loanType} loan, amount: ${amount}, tenure: ${tenure}`);

  // Select Loan Category button
  cy.contains('button', `${loanType} Loan`).click();
  cy.contains('button', `${loanType} Loan`).should('have.attr', 'aria-pressed', 'true');

  // Fill amount if specified
  if (amount) {
    cy.get('#loanAmountInput')
      .clear()
      .type(String(amount))
      .should('have.value', Number(amount).toLocaleString('en-IN'));
  }

  // Fill tenure if specified
  if (tenure) {
    cy.get('#loanTenureInput')
      .clear()
      .type(String(tenure))
      .should('have.value', String(tenure));
  }

  // Select purpose if specified
  if (purpose) {
    cy.get('#loanPurpose').select(purpose);
  }

  // Verify real-time EMI estimate card is populated
  cy.contains('Estimated EMI').should('be.visible');
});

/**
 * Step 2: Fill Personal Information & Contact Details
 * @param {Object} personalData
 */
Cypress.Commands.add('fillStep2', (personalData = {}) => {
  const data = {
    fullName: 'RAJESH KUMAR SHARMA',
    dob: '1990-05-15',
    gender: 'male',
    maritalStatus: 'single',
    fatherName: 'RAMESH SHARMA',
    motherName: 'SUNITA SHARMA',
    mobileNumber: '9876543210',
    email: 'rajesh.sharma@example.com',
    alternateMobile: '',
    ...personalData,
  };

  cy.log(`Filling Step 2: ${data.fullName}`);

  if (data.fullName) {
    cy.get('#fullName').clear().type(data.fullName);
  }

  if (data.dob) {
    cy.get('#dob').clear().type(data.dob);
  }

  if (data.gender) {
    cy.get('#gender').select(data.gender);
  }

  if (data.maritalStatus) {
    cy.get('#maritalStatus').select(data.maritalStatus);
  }

  if (data.fatherName) {
    cy.get('#fatherName').clear().type(data.fatherName);
  }

  if (data.motherName) {
    cy.get('#motherName').clear().type(data.motherName);
  }

  if (data.mobileNumber) {
    cy.get('#mobileNumber').clear().type(data.mobileNumber);
  }

  if (data.email) {
    cy.get('#email').clear().type(data.email);
  }

  if (data.alternateMobile) {
    cy.get('#alternateMobile').clear().type(data.alternateMobile);
  }
});

/**
 * Step 3: Statutory KYC & Government ID Verification
 * Valid default PAN: 'ABCPE1234F' (Individual entity 'P' as 4th char)
 * Valid default Aadhaar: '987654321012' (Passes Verhoeff D5 checksum)
 * @param {Object} kycData
 */
Cypress.Commands.add('fillStep3', (kycData = {}) => {
  const data = {
    panNumber: 'ABCPE1234F',
    aadhaarNumber: '987654321012',
    aadhaarConsent: true,
    voterId: '',
    passportNumber: '',
    ...kycData,
  };

  cy.log(`Filling Step 3: PAN=${data.panNumber}, Aadhaar=${data.aadhaarNumber}`);

  if (data.panNumber) {
    cy.get('#panNumberInput').clear().type(data.panNumber).blur();
    // Wait for 1.5s simulated NSDL validation if valid
    if (data.waitForVerification !== false) {
      cy.contains('✓ Verified', { timeout: 5000 }).should('be.visible');
    }
  }

  if (data.aadhaarNumber) {
    cy.get('#aadhaarNumberInput').clear().type(data.aadhaarNumber).blur();
    // Wait for 1.5s simulated Verhoeff validation if valid
    if (data.waitForVerification !== false) {
      cy.contains('✓ Verified (Verhoeff Passed)', { timeout: 5000 }).should('be.visible');
    }
  }

  if (data.aadhaarConsent) {
    cy.get('input[type="checkbox"][name="aadhaarConsent"]').check({ force: true });
  }

  if (data.voterId) {
    cy.get('#voterId').clear().type(data.voterId);
  }

  if (data.passportNumber) {
    cy.get('#passportNumber').clear().type(data.passportNumber);
  }
});

/**
 * Step 7: Draw Digital Signature
 */
Cypress.Commands.add('drawSignature', () => {
  cy.log('Drawing digital signature on canvas');

  cy.get('canvas[aria-label="Digital Signature Drawing Area"]').then(($canvas) => {
    const canvas = $canvas[0];
    const rect = canvas.getBoundingClientRect();
    const startX = rect.width / 4;
    const startY = rect.height / 2;

    // Trigger realistic mouse drawing events
    cy.wrap($canvas)
      .trigger('mousedown', { button: 0, clientX: rect.left + startX, clientY: rect.top + startY, force: true })
      .trigger('mousemove', { button: 0, clientX: rect.left + startX + 50, clientY: rect.top + startY - 20, force: true })
      .trigger('mousemove', { button: 0, clientX: rect.left + startX + 100, clientY: rect.top + startY + 20, force: true })
      .trigger('mousemove', { button: 0, clientX: rect.left + startX + 150, clientY: rect.top + startY, force: true })
      .trigger('mouseup', { force: true });
  });

  // Ensure signature captured badge is shown
  cy.contains('✓ Signature Captured', { timeout: 4000 }).should('be.visible');
});

/**
 * Step 4: Fill Address
 * @param {Object} addressData
 */
Cypress.Commands.add('fillStep4', (addressData = {}) => {
  const data = {
    addressLine1: 'Flat 402, Shivalik Residency, MG Road',
    addressLine2: 'Near Metro Station',
    pincode: '110001',
    residenceType: 'Owned',
    yearsAtAddress: 3,
    sameAsPermanent: true,
    ...addressData,
  };

  cy.log(`Filling Step 4: PIN=${data.pincode}`);

  cy.get('#currentAddressLine1').clear().type(data.addressLine1);

  if (data.addressLine2) {
    cy.get('#currentAddressLine2').clear().type(data.addressLine2);
  }

  cy.get('#pincode').clear().type(data.pincode);

  // Check auto-filled city or wait for PIN lookup
  cy.get('#city', { timeout: 4000 }).should('not.have.value', '');

  if (data.residenceType) {
    cy.get('#residenceType').select(data.residenceType);
  }

  if (data.yearsAtAddress !== undefined) {
    cy.get('#yearsAtAddress').clear().type(String(data.yearsAtAddress));
  }

  if (data.sameAsPermanent) {
    cy.get('input[name="sameAsPermanent"]').check({ force: true });
  } else {
    cy.get('input[name="sameAsPermanent"]').uncheck({ force: true });
  }
});

/**
 * Step 5: Fill Employment Information
 * @param {Object} empData
 */
Cypress.Commands.add('fillStep5', (empData = {}) => {
  const data = {
    type: 'Salaried',
    companyName: 'Tata Consultancy Services',
    designation: 'Lead Software Architect',
    monthlyNetSalary: '95000',
    yearsOfExperience: '6',
    ...empData,
  };

  cy.log(`Filling Step 5: Employment Type=${data.type}`);

  if (data.type === 'Salaried') {
    cy.contains('button[role="radio"]', 'Salaried').click();
    cy.get('#companyName').clear().type(data.companyName);
    cy.get('#designation').clear().type(data.designation);
    cy.get('#monthlyNetSalary').clear().type(String(data.monthlyNetSalary));
    cy.get('#yearsOfExperience').clear().type(String(data.yearsOfExperience));
  } else if (data.type === 'Self-Employed') {
    cy.contains('button[role="radio"]', 'Self-Employed').click();
    cy.get('#businessName').clear().type(data.businessName || 'Sharma Advisory Services');
    cy.get('#businessType').select(data.businessType || 'Chartered Accountant / Financial Consultant');
    cy.get('#annualTurnover').clear().type(String(data.annualTurnover || '1200000'));
    cy.get('#yearsInBusiness').clear().type(String(data.yearsInBusiness || '4'));
    cy.get('#monthlyIncome').clear().type(String(data.monthlyIncome || '85000'));
  } else if (data.type === 'Business Owner') {
    cy.contains('button[role="radio"]', 'Business Owner').click();
    cy.get('#businessNameOwner').clear().type(data.businessName || 'Apex Precision Technologies');
    cy.get('#businessTypeOwner').select(data.businessType || 'Private Limited Company');
    cy.get('#gstNumber').clear().type(data.gstNumber || '27ABCDE1234F1Z5');
    cy.get('#businessAddress').clear().type(data.businessAddress || 'Plot 42, MIDC Industrial Area, Pune, Maharashtra 411018');
    cy.get('#annualTurnoverOwner').clear().type(String(data.annualTurnover || '8500000'));
    cy.get('#yearsInBusinessOwner').clear().type(String(data.yearsInBusiness || '5'));
    cy.get('#monthlyIncomeOwner').clear().type(String(data.monthlyIncome || '250000'));
  }
});

/**
 * Step 6: Fill Co-Applicant Details
 * @param {Object} coApplicantData
 */
Cypress.Commands.add('fillStep6', (coApplicantData = {}) => {
  const data = {
    name: 'ANITA RAJESH SHARMA',
    relationship: 'Spouse',
    pan: 'VWXPG5678G',
    income: '75000',
    consent: true,
    ...coApplicantData,
  };

  cy.log(`Filling Step 6: CoApplicant=${data.name}, Relationship=${data.relationship}`);

  cy.get('#coApplicantName').clear().type(data.name);
  cy.get('#relationship').select(data.relationship);
  cy.get('#coApplicantPan').clear().type(data.pan).blur();
  cy.contains('✓ Verified', { timeout: 5000 }).should('be.visible');
  cy.get('#coApplicantIncome').clear().type(String(data.income));

  if (data.consent) {
    cy.get('input[type="checkbox"][name="coApplicantConsent"]').check({ force: true });
  }
});

/**
 * Step 7: Upload dummy test document to dropzone
 * @param {string} dropzoneLabel
 * @param {string} fileName
 * @param {string} mimeType
 */
Cypress.Commands.add('uploadTestDocument', (dropzoneLabel, fileName = 'sample_document.pdf', mimeType = 'application/pdf') => {
  cy.log(`Uploading test document: ${fileName} for ${dropzoneLabel}`);

  cy.contains('label', dropzoneLabel)
    .parents('.rounded-xl')
    .find('input[type="file"]')
    .selectFile(
      {
        contents: Cypress.Buffer.from('sample pdf dummy content for KYC document upload testing'),
        fileName,
        mimeType,
        lastModified: Date.now(),
      },
      { force: true }
    );
});

/**
 * Step 8: Check All 4 Mandatory RBI Consents
 */
Cypress.Commands.add('checkAllStep8Consents', () => {
  cy.log('Checking all 4 mandatory Step 8 RBI consents');
  cy.get('input[name="consentInformationAccuracy"]').check({ force: true });
  cy.get('input[name="consentCreditBureau"]').check({ force: true });
  cy.get('input[name="consentTermsKfs"]').check({ force: true });
  cy.get('input[name="consentRegulatoryComm"]').check({ force: true });
});

/**
 * Stepper Navigation: Next Step
 */
Cypress.Commands.add('nextStep', () => {
  cy.get('button[aria-label="Continue to next step"], button[aria-label="Submit loan application"]')
    .first()
    .click();
});

/**
 * Stepper Navigation: Previous Step
 */
Cypress.Commands.add('prevStep', () => {
  cy.get('button[aria-label="Go back to previous step"]').first().click();
});
