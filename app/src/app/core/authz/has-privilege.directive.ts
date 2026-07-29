import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthzService } from './authz.service';

/**
 * Structural directive that renders its host element only when the current
 * user holds the required privilege code(s).
 *
 * Usage:
 *   *hasPrivilege="'some:code'"
 *   *hasPrivilege="['a', 'b']; mode: 'all'"
 *
 * The embedded view is created/cleared reactively from `AuthzService` via an
 * `effect()`, so it updates automatically on hydrate/clear.
 */
@Directive({
  selector: '[hasPrivilege]',
  standalone: true,
})
export class HasPrivilegeDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authz = inject(AuthzService);

  readonly hasPrivilege = input.required<string | string[]>();
  readonly hasPrivilegeMode = input<'any' | 'all'>('any');

  private hasView = false;

  constructor() {
    effect(() => {
      const value = this.hasPrivilege();
      const codes = Array.isArray(value) ? value : [value];
      const granted =
        codes.length === 0
          ? true
          : this.hasPrivilegeMode() === 'all'
            ? this.authz.hasAll(codes)
            : this.authz.hasAny(codes);

      if (granted && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!granted && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
