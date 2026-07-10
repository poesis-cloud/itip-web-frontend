describe('E2E runtime connectivity', () => {
  it('loads frontend and reaches backend through Angular proxy', () => {
    cy.visit('/login');
    cy.contains('Connexion').should('be.visible');

    cy.request('http://localhost:8080/actuator/health')
      .its('body.status')
      .should('eq', 'UP');

    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      failOnStatusCode: false,
      body: {
        email: 'e2e@itip.local',
        password: 'wrong',
      },
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
