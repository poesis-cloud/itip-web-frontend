export type AuthorizationOrigin = 'DEFMAN' | 'ITIP' | 'UI';

export type AuthorizationAction =
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
  action: AuthorizationAction;
  resourceId?: string;
}

export interface AuthorizationDecision extends AuthorizationCheck {
  allowed: boolean;
}

export interface AuthorizationCheckManyResponse {
  decisions: AuthorizationDecision[];
}

export function authorizationKey(check: AuthorizationCheck): string {
  return [check.origin, check.resource, check.action, check.resourceId ?? ''].join(':');
}