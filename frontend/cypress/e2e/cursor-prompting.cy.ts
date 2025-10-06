describe('Cursor Prompting Feature', () => {
  beforeEach(() => {
    // Visit the main page
    cy.visit('/');
  });

  describe('Basic Functionality', () => {
    it('should display the cursor prompt button', () => {
      cy.waitForCursorPrompt();
      cy.get('[aria-label="Open AI Assistant"]').should('be.visible');
      cy.get('[aria-label="Open AI Assistant"]').should('have.class', 'bg-indigo-600');
    });

    it('should open and close the cursor prompt panel', () => {
      cy.waitForCursorPrompt();
      
      // Open the panel
      cy.openCursorPrompt();
      cy.contains('AI Assistant').should('be.visible');
      cy.get('textarea[placeholder*="Ask me anything"]').should('be.visible');
      
      // Close the panel
      cy.get('[aria-label="Close"]').click();
      cy.get('.fixed.bottom-24').should('not.exist');
    });

    it('should display prompt suggestions', () => {
      cy.openCursorPrompt();
      
      // Wait for suggestions to load
      cy.wait('@getSuggestions');
      
      // Check suggestions are displayed
      cy.contains('Try asking:').should('be.visible');
      cy.contains('How can I improve my resume?').should('be.visible');
      cy.contains('What sections should I prioritize?').should('be.visible');
    });
  });

  describe('Prompt Submission', () => {
    beforeEach(() => {
      // Mock the cursor prompt API response
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 200,
        body: {
          response: 'To improve your resume, focus on quantifying your achievements and using strong action verbs.',
          session_id: 'test-session-123',
          cached: false,
          tokens_used: 50,
          response_time_ms: 250
        }
      }).as('submitPrompt');
    });

    it('should submit a prompt and display response', () => {
      cy.openCursorPrompt();
      
      // Type a question
      cy.typeInCursorPrompt('How can I improve my resume?');
      
      // Submit the prompt
      cy.submitCursorPrompt();
      
      // Check loading state
      cy.get('svg.animate-spin').should('be.visible');
      
      // Wait for API response
      cy.wait('@submitPrompt');
      
      // Check response is displayed
      cy.contains('To improve your resume, focus on quantifying').should('be.visible');
      
      // Check prompt is cleared
      cy.get('textarea[placeholder*="Ask me anything"]').should('have.value', '');
    });

    it('should handle Enter key submission', () => {
      cy.openCursorPrompt();
      
      // Type and press Enter
      cy.typeInCursorPrompt('Quick question{enter}');
      
      // Should trigger submission
      cy.wait('@submitPrompt');
    });

    it('should handle Shift+Enter for new line', () => {
      cy.openCursorPrompt();
      
      // Type with Shift+Enter
      cy.get('textarea[placeholder*="Ask me anything"]')
        .type('Line 1{shift+enter}Line 2');
      
      // Should not submit
      cy.get('svg.animate-spin').should('not.exist');
      
      // Textarea should contain both lines
      cy.get('textarea[placeholder*="Ask me anything"]')
        .invoke('val')
        .should('include', 'Line 1')
        .and('include', 'Line 2');
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', () => {
      // Mock API error
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 500,
        body: { detail: 'Internal server error' }
      }).as('submitPromptError');
      
      cy.openCursorPrompt();
      cy.typeInCursorPrompt('Test error handling');
      cy.submitCursorPrompt();
      
      cy.wait('@submitPromptError');
      
      // Should display error
      cy.contains('Failed to get response').should('be.visible');
      cy.get('.bg-red-50').should('be.visible');
    });

    it('should handle rate limiting', () => {
      // Mock rate limit error
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 429,
        body: { detail: 'Rate limit exceeded' },
        headers: { 'X-RateLimit-Reset': '1234567890' }
      }).as('rateLimited');
      
      cy.openCursorPrompt();
      cy.typeInCursorPrompt('Test rate limit');
      cy.submitCursorPrompt();
      
      cy.wait('@rateLimited');
      
      // Should display rate limit error
      cy.contains('Failed to get response').should('be.visible');
    });
  });

  describe('Context Awareness', () => {
    it('should update suggestions when navigating sections', () => {
      // First, upload a resume to see course selection
      cy.fixture('sample-resume.pdf').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: fileContent,
          fileName: 'sample-resume.pdf',
          mimeType: 'application/pdf'
        });
      });
      
      // Mock upload response
      cy.intercept('POST', '**/upload-resume', {
        statusCode: 200,
        body: {
          filename: 'sample-resume.pdf',
          text: 'Sample resume text',
          course_work: [
            { course_number: 'CS101', course_title: 'Intro to CS' },
            { course_number: 'CS201', course_title: 'Data Structures' }
          ]
        }
      }).as('uploadResume');
      
      cy.get('button').contains('Upload').click();
      cy.wait('@uploadResume');
      
      // Now check that context is updated
      cy.intercept('GET', '**/api/prompts/suggestions*', (req) => {
        // Check that current_section is sent
        expect(req.query).to.have.property('current_section');
        
        req.reply({
          statusCode: 200,
          body: {
            suggestions: [
              'Which courses best demonstrate my technical skills?',
              'How do I connect coursework to job requirements?'
            ]
          }
        });
      }).as('getContextualSuggestions');
      
      cy.openCursorPrompt();
      cy.wait('@getContextualSuggestions');
      
      // Should show course-related suggestions
      cy.contains('Which courses best demonstrate').should('be.visible');
    });
  });

  describe('Performance Features', () => {
    it('should show cached indicator for cached responses', () => {
      // Mock cached response
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 200,
        body: {
          response: 'This is a cached response for better performance.',
          session_id: 'test-session-123',
          cached: true,
          response_time_ms: 5
        }
      }).as('cachedResponse');
      
      cy.openCursorPrompt();
      cy.typeInCursorPrompt('Common question');
      cy.submitCursorPrompt();
      
      cy.wait('@cachedResponse');
      
      // In dev mode, would log performance info
      // Could add visual indicator for cached responses
    });

    it('should handle response preview for long responses', () => {
      const longResponse = 'This is the beginning of a very long response. '.repeat(20);
      const preview = 'This is the beginning of a very long response...';
      
      // Mock response with preview
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 200,
        body: {
          response: longResponse,
          response_preview: preview,
          session_id: 'test-session-123',
          cached: false,
          response_time_ms: 1000
        }
      }).as('longResponse');
      
      cy.openCursorPrompt();
      cy.typeInCursorPrompt('Tell me everything');
      cy.submitCursorPrompt();
      
      cy.wait('@longResponse');
      
      // Should show preview first, then full response
      cy.contains(preview.substring(0, 30)).should('be.visible');
    });
  });

  describe('Suggestion Click', () => {
    it('should populate prompt when clicking suggestion', () => {
      cy.openCursorPrompt();
      cy.wait('@getSuggestions');
      
      // Click a suggestion
      cy.contains('How can I improve my resume?').click();
      
      // Should populate the textarea
      cy.get('textarea[placeholder*="Ask me anything"]')
        .should('have.value', 'How can I improve my resume?');
      
      // Suggestions should hide
      cy.contains('Try asking:').should('not.exist');
      
      // Textarea should be focused
      cy.get('textarea[placeholder*="Ask me anything"]').should('have.focus');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport('iphone-x');
    });

    it('should work on mobile devices', () => {
      cy.waitForCursorPrompt();
      
      // Button should be visible but positioned appropriately
      cy.get('[aria-label="Open AI Assistant"]').should('be.visible');
      
      // Open panel
      cy.openCursorPrompt();
      
      // Panel should fit mobile screen
      cy.get('.fixed.bottom-24')
        .should('be.visible')
        .and('have.css', 'width')
        .and('not.equal', '0px');
      
      // Should be able to type and submit
      cy.typeInCursorPrompt('Mobile test');
      cy.get('textarea').should('have.value', 'Mobile test');
    });
  });
});

// Integration test with actual resume upload flow
describe('Cursor Prompting with Resume Upload Flow', () => {
  it('should provide contextual help during resume upload', () => {
    cy.visit('/');
    
    // Start with upload context
    cy.openCursorPrompt();
    cy.contains('How can I improve my resume?').should('be.visible');
    
    // Close prompt
    cy.get('[aria-label="Close"]').click();
    
    // Upload a resume
    cy.fixture('sample-resume.pdf').then(fileContent => {
      cy.get('input[type="file"]').selectFile({
        contents: fileContent,
        fileName: 'sample-resume.pdf',
        mimeType: 'application/pdf'
      });
    });
    
    // Mock successful upload
    cy.intercept('POST', '**/upload-resume', {
      statusCode: 200,
      body: {
        filename: 'sample-resume.pdf',
        text: 'John Doe - Software Engineer',
        header: '<p>John Doe | john@example.com</p>',
        course_work: [
          { course_number: 'CS101', course_title: 'Introduction to Computer Science' }
        ]
      }
    }).as('uploadSuccess');
    
    cy.get('button').contains('Upload').click();
    cy.wait('@uploadSuccess');
    
    // Now cursor prompt should have different context
    cy.intercept('POST', '**/api/prompts/cursor', (req) => {
      // Verify context includes resume data
      expect(req.body.context).to.have.property('hasResumeUploaded', true);
      
      req.reply({
        statusCode: 200,
        body: {
          response: 'Based on your uploaded resume, I recommend highlighting your CS101 coursework.',
          session_id: 'test-session-456',
          cached: false
        }
      });
    }).as('contextualPrompt');
    
    cy.openCursorPrompt();
    cy.typeInCursorPrompt('Should I include CS101?');
    cy.submitCursorPrompt();
    
    cy.wait('@contextualPrompt');
    cy.contains('Based on your uploaded resume').should('be.visible');
  });
});