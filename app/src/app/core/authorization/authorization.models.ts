export type AuthorizationOrigin = 'DEFMAN' | 'ITIP' | 'UI';

export type AuthorizationOperation =
  | 'CREATE'
  | 'READ'
  | 'SUBMIT'
  | 'APPROVE'
  | 'ACTIVATE'
  | 'UPDATE'
  | 'DISABLE'
  | 'VIEW';

export interface AuthorizationCheck {
  origin: AuthorizationOrigin;
  resource: string;
  operation: AuthorizationOperation;
  resourceId?: string;
}

export interface AuthorizationDecision extends AuthorizationCheck {
  allowed: boolean;
}

export interface AuthorizationCheckManyResponse {
  decisions: AuthorizationDecision[];
}

export function authorizationKey(check: AuthorizationCheck): string {
  return [check.origin, check.resource, check.operation, check.resourceId ?? ''].join(':');
}