import { AuthorizationCheck } from './authorization.models';

export interface MenuAuthorizationItem {
  id: string;
  check?: AuthorizationCheck;
}

export const USERS_MENU_CHECK: AuthorizationCheck = {
  origin: 'ITIP',
  resource: 'ACCOUNT',
  operation: 'READ',
};

export const SHELL_MENU_AUTHORIZATION: readonly MenuAuthorizationItem[] = [
  { id: 'dashboard' },
  { id: 'users', check: USERS_MENU_CHECK },
];

export const SHELL_MENU_CHECKS = SHELL_MENU_AUTHORIZATION.flatMap((item) =>
  item.check ? [item.check] : [],
);