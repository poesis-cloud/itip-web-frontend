describe('Authentication flow', () => {
  it('redirects unauthenticated users from /dashboard to /login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('logs in and redirects to dashboard', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        expiresAt: Date.now() + 60_000
      }
    }).as('login');

    cy.visit('/login');
    cy.get('input#email').type('john.doe@itip.local');
    cy.get('input#password').type('secret');
    cy.contains('button', 'Se connecter').click();

    cy.wait('@login');
    cy.url().should('include', '/dashboard');
  });

  it('shows error for invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {}
    }).as('loginFailed');

    cy.visit('/login');
    cy.get('input#email').type('john.doe@itip.local');
    cy.get('input#password').type('wrong');
    cy.contains('button', 'Se connecter').click();

    cy.wait('@loginFailed');
    cy.contains('Adresse email ou mot de passe invalide.').should('be.visible');
  });
});
