import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AuthorizationCheck, authorizationKey } from './authorization.models';
import { AuthorizationService } from './authorization.service';

@Directive({
  selector: '[hasAuthorization]',
  standalone: true,
})
export class HasAuthorizationDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authorization = inject(AuthorizationService);
  private readonly auth = inject(AuthService);

  readonly hasAuthorization = input.required<AuthorizationCheck | AuthorizationCheck[]>();
  readonly hasAuthorizationMode = input<'any' | 'all'>('any');

  private hasView = false;

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        if (this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
        return;
      }

      const value = this.hasAuthorization();
      const checks = Array.isArray(value) ? value : [value];
      const decisions = this.authorization.decisions();
      const pending = this.authorization.pending();
      const missing = checks.filter((check) => !decisions.has(authorizationKey(check)));

      if (missing.some((check) => !pending.has(authorizationKey(check)))) {
        this.authorization.canMany(missing).subscribe();
      }

      const granted =
        checks.length === 0
          ? true
          : this.hasAuthorizationMode() === 'all'
            ? checks.every((check) => decisions.get(authorizationKey(check))?.allowed === true)
            : checks.some((check) => decisions.get(authorizationKey(check))?.allowed === true);

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