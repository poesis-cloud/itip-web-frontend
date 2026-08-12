import { Privilege, PrivilegeCode } from './privilege.catalog';

/**
 * Rename tripwire: these codes are what the UI depends on. If a value here
 * changes, a real feature gate (or its backend counterpart) is likely breaking.
 */
describe('Privilege catalog', () => {
  it('pins the placeholder codes the UI depends on', () => {
    expect(Privilege.DashboardView).toBe('dashboard:view');
    expect(Privilege.DashboardManage).toBe('dashboard:manage');
  });

  it('exposes a type derived from the catalog values', () => {
    const code: PrivilegeCode = Privilege.DashboardView;
    expect(code).toBe('dashboard:view');
  });
});
