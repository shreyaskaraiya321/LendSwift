// ***********************************************************
// LendSwift Cypress Support Entry
// ***********************************************************

import './commands';

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (_err, _runnable) => {
  return false;
});
