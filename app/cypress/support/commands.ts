type LoginSuccessResponse = {
  token: string;
  expiresAt: number;
};

const AUTH_LOGIN_ENDPOINT = '/api/auth/login';

Cypress.Commands.add('mockAuthLoginSuccess', (alias = 'login', response = {}) => {
  const body: LoginSuccessResponse = {
    token: 'fake-jwt-token',
    expiresAt: Date.now() + 60_000,
    ...response,
  };

  cy.intercept('POST', AUTH_LOGIN_ENDPOINT, {
    statusCode: 200,
    body,
  }).as(alias);
});

Cypress.Commands.add('mockAuthLoginFailure', (alias = 'loginFailed', statusCode = 401) => {
  cy.intercept('POST', AUTH_LOGIN_ENDPOINT, {
    statusCode,
    body: {},
  }).as(alias);
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockAuthLoginSuccess(alias?: string, response?: Partial<LoginSuccessResponse>): Chainable<void>;
      mockAuthLoginFailure(alias?: string, statusCode?: number): Chainable<void>;
    }
  }
}

export {};
