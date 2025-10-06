// E2E support file
// Add custom commands and global configurations here

// Custom command to wait for cursor prompt to be ready
Cypress.Commands.add('waitForCursorPrompt', () => {
  cy.get('[aria-label="Open AI Assistant"]', { timeout: 10000 }).should('be.visible');
});

// Custom command to open cursor prompt
Cypress.Commands.add('openCursorPrompt', () => {
  cy.get('[aria-label="Open AI Assistant"]').click();
  cy.get('.fixed.bottom-24').should('be.visible');
});

// Custom command to type in cursor prompt
Cypress.Commands.add('typeInCursorPrompt', (text: string) => {
  cy.get('textarea[placeholder*="Ask me anything"]').type(text);
});

// Custom command to submit cursor prompt
Cypress.Commands.add('submitCursorPrompt', () => {
  cy.get('button[type="submit"]').last().click();
});

// Intercept API calls for testing
beforeEach(() => {
  // Mock authentication
  cy.intercept('GET', '**/api/prompts/suggestions*', {
    statusCode: 200,
    body: {
      suggestions: [
        'How can I improve my resume?',
        'What sections should I prioritize?',
        'How do I tailor my resume for specific roles?',
        'What are common resume mistakes to avoid?'
      ]
    }
  }).as('getSuggestions');
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      waitForCursorPrompt(): Chainable<void>;
      openCursorPrompt(): Chainable<void>;
      typeInCursorPrompt(text: string): Chainable<void>;
      submitCursorPrompt(): Chainable<void>;
    }
  }
}

export {};