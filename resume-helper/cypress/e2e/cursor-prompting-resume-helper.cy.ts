describe('Cursor Prompting in Resume Helper', () => {
  beforeEach(() => {
    // Visit the upload page
    cy.visit('/');
  });

  describe('Upload Screen Context', () => {
    it('should show cursor prompt on upload screen', () => {
      // Wait for page to load
      cy.contains('Upload Your Documents').should('be.visible');
      
      // Cursor prompt button should be visible
      cy.get('[aria-label="Open AI Assistant"]').should('be.visible');
      cy.get('[aria-label="Open AI Assistant"]').should('have.class', 'bg-blue-600');
    });

    it('should provide upload-specific suggestions', () => {
      // Mock suggestions API
      cy.intercept('GET', '**/api/prompts/suggestions*', {
        statusCode: 200,
        body: {
          suggestions: [
            'What documents should I upload?',
            'Is my resume format acceptable?',
            'Should I include a cover letter?',
            'What file types are supported?'
          ]
        }
      }).as('getUploadSuggestions');

      // Open cursor prompt
      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.wait('@getUploadSuggestions');

      // Check upload-specific suggestions
      cy.contains('What documents should I upload?').should('be.visible');
      cy.contains('What file types are supported?').should('be.visible');
    });
  });

  describe('Edit Screen Context', () => {
    beforeEach(() => {
      // Mock the resume data
      cy.window().then((win) => {
        // Set initial resume data in the store
        win.localStorage.setItem('resume-data', JSON.stringify({
          header: { content: '<p>John Doe</p>', isConfirmed: false },
          projects: { content: '<p>Project 1</p>', isConfirmed: false },
          skills: { content: '<p>Python, React</p>', isConfirmed: true },
          experience: { content: '<p>Software Engineer</p>', isConfirmed: false },
          education: { content: '<p>BS Computer Science</p>', isConfirmed: false }
        }));
      });

      // Navigate to edit screen
      cy.visit('/edit');
    });

    it('should track current editing section', () => {
      // Mock the API to verify context
      cy.intercept('POST', '**/api/prompts/cursor', (req) => {
        // Check that context includes sections confirmed status
        expect(req.body.context).to.have.property('sections_confirmed');
        expect(req.body.context.sections_confirmed).to.deep.include({
          skills: true,
          header: false
        });

        req.reply({
          statusCode: 200,
          body: {
            response: 'Your skills section looks great! Consider adding proficiency levels.',
            session_id: 'edit-session-123',
            cached: false
          }
        });
      }).as('editContextPrompt');

      // Open cursor prompt
      cy.get('[aria-label="Open AI Assistant"]').click();

      // Ask about skills (which is confirmed)
      cy.get('textarea[placeholder*="Ask for help"]').type('Are my skills well organized?');
      cy.get('button[type="submit"]').last().click();

      cy.wait('@editContextPrompt');
      cy.contains('Your skills section looks great').should('be.visible');
    });

    it('should provide section-specific suggestions', () => {
      // Click on projects section to edit
      cy.contains('Projects').click();

      // Mock section-specific suggestions
      cy.intercept('GET', '**/api/prompts/suggestions*', (req) => {
        expect(req.query.current_section).to.equal('projects');
        
        req.reply({
          statusCode: 200,
          body: {
            suggestions: [
              'How can I make my project descriptions more impactful?',
              'What technical details should I include in my projects?',
              'How do I highlight the business value of my projects?',
              'Should I include personal projects or only professional ones?'
            ]
          }
        });
      }).as('getProjectSuggestions');

      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.wait('@getProjectSuggestions');

      // Should show project-specific suggestions
      cy.contains('How can I make my project descriptions more impactful?').should('be.visible');
      cy.contains('What technical details should I include').should('be.visible');
    });
  });

  describe('Real-time Assistance Integration', () => {
    it('should work alongside AI Helper Panel', () => {
      cy.visit('/edit');

      // Both AI features should be available
      cy.get('[aria-label="Open AI Assistant"]').should('be.visible'); // Cursor prompt
      cy.contains('AI Helper').should('be.visible'); // Existing AI panel

      // Open cursor prompt
      cy.get('[aria-label="Open AI Assistant"]').click();
      
      // Should not interfere with AI Helper Panel
      cy.contains('Resume AI Assistant').should('be.visible');
      
      // Close cursor prompt
      cy.get('[aria-label="Close"]').click();

      // AI Helper Panel should still be accessible
      cy.contains('AI Helper').should('be.visible');
    });

    it('should maintain context across navigation', () => {
      // Start on upload page
      cy.visit('/');
      
      // Ask a question
      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.get('textarea[placeholder*="Ask for help"]').type('What makes a good resume?');
      
      // Mock response with session ID
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 200,
        body: {
          response: 'A good resume should be concise, relevant, and impactful.',
          session_id: 'session-789',
          cached: false
        }
      }).as('firstPrompt');

      cy.get('button[type="submit"]').last().click();
      cy.wait('@firstPrompt');

      // Upload files and navigate to edit
      cy.get('[aria-label="Close"]').click();
      
      // Mock file upload process...
      // Navigate to edit screen
      cy.visit('/edit');

      // Open cursor prompt again
      cy.get('[aria-label="Open AI Assistant"]').click();

      // Previous conversation should influence context
      cy.intercept('POST', '**/api/prompts/cursor', (req) => {
        // Could check for session continuity
        expect(req.body.session_id).to.equal('session-789');
        
        req.reply({
          statusCode: 200,
          body: {
            response: 'Building on our earlier discussion about good resumes...',
            session_id: 'session-789',
            cached: false
          }
        });
      }).as('continuedPrompt');

      cy.get('textarea[placeholder*="Ask for help"]').type('How do I apply that to my experience section?');
      cy.get('button[type="submit"]').last().click();
      
      cy.wait('@continuedPrompt');
      cy.contains('Building on our earlier discussion').should('be.visible');
    });
  });

  describe('Performance in Resume Helper', () => {
    it('should handle rapid section switching', () => {
      cy.visit('/edit');

      // Rapidly switch between sections
      const sections = ['Header', 'Projects', 'Skills', 'Experience', 'Education'];
      
      sections.forEach((section, index) => {
        // Click section
        cy.contains(section).click();

        // Mock different suggestions for each section
        cy.intercept('GET', '**/api/prompts/suggestions*', {
          statusCode: 200,
          body: {
            suggestions: [`Suggestion for ${section} 1`, `Suggestion for ${section} 2`]
          }
        }).as(`suggestions${index}`);
      });

      // Open cursor prompt after rapid switching
      cy.get('[aria-label="Open AI Assistant"]').click();

      // Should show suggestions for the last selected section
      cy.contains('Suggestion for Education').should('be.visible');
    });

    it('should cache responses for common questions', () => {
      cy.visit('/edit');

      // First request - not cached
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 200,
        body: {
          response: 'Here are tips for your resume...',
          session_id: 'test-123',
          cached: false,
          response_time_ms: 1000
        }
      }).as('firstRequest');

      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.get('textarea[placeholder*="Ask for help"]').type('General resume tips');
      cy.get('button[type="submit"]').last().click();
      
      cy.wait('@firstRequest');
      cy.get('[aria-label="Close"]').click();

      // Second identical request - should be cached
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 200,
        body: {
          response: 'Here are tips for your resume...',
          session_id: 'test-123',
          cached: true,
          response_time_ms: 5
        }
      }).as('cachedRequest');

      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.get('textarea[placeholder*="Ask for help"]').type('General resume tips');
      cy.get('button[type="submit"]').last().click();
      
      cy.wait('@cachedRequest').then((interception) => {
        // Response should be much faster
        expect(interception.response.body.response_time_ms).to.be.lessThan(10);
        expect(interception.response.body.cached).to.be.true;
      });
    });
  });

  describe('Error Scenarios in Resume Helper', () => {
    it('should handle network errors gracefully', () => {
      cy.visit('/edit');

      // Simulate network error
      cy.intercept('POST', '**/api/prompts/cursor', { forceNetworkError: true }).as('networkError');

      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.get('textarea[placeholder*="Ask for help"]').type('Help with resume');
      cy.get('button[type="submit"]').last().click();

      cy.wait('@networkError');

      // Should show user-friendly error
      cy.contains('Failed to get response').should('be.visible');
      
      // Should be able to retry
      cy.get('textarea[placeholder*="Ask for help"]').should('not.be.disabled');
    });

    it('should handle authentication errors', () => {
      cy.visit('/edit');

      // Mock auth failure
      cy.intercept('POST', '**/api/prompts/cursor', {
        statusCode: 403,
        body: { detail: 'Invalid authentication credentials' }
      }).as('authError');

      cy.get('[aria-label="Open AI Assistant"]').click();
      cy.get('textarea[placeholder*="Ask for help"]').type('Test auth');
      cy.get('button[type="submit"]').last().click();

      cy.wait('@authError');

      // Should show auth error
      cy.contains('Failed to get response').should('be.visible');
    });
  });
});