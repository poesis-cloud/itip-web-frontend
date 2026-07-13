import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

function startsWithApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function startsWithActuatorPath(pathname: string): boolean {
  return pathname === '/actuator' || pathname.startsWith('/actuator/');
}

function isProtectedPath(pathname: string): boolean {
  return startsWithApiPath(pathname) || startsWithActuatorPath(pathname);
}

function isProtectedApiRequest(request: HttpRequest<unknown>, apiBaseUrl: string): boolean {
  const requestUrl = new URL(request.url, window.location.origin);

  if (!apiBaseUrl) {
    return requestUrl.origin === window.location.origin && isProtectedPath(requestUrl.pathname);
  }

  const baseUrl = new URL(apiBaseUrl, window.location.origin);

  if (requestUrl.origin !== baseUrl.origin) {
    return false;
  }

  const basePath = baseUrl.pathname.replace(/\/$/, '');

  if (!basePath) {
    return isProtectedPath(requestUrl.pathname);
  }

  return (
    requestUrl.pathname === `${basePath}/api` ||
    requestUrl.pathname.startsWith(`${basePath}/api/`) ||
    requestUrl.pathname === `${basePath}/actuator` ||
    requestUrl.pathname.startsWith(`${basePath}/actuator/`)
  );
}

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getValidAccessToken();
  const isProtected = isProtectedApiRequest(request, auth.apiBaseUrl);

  const authRequest =
    token !== null && isProtected
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && isProtected) {
        if (error.status === 401) {
          // Authentication failure: clear the session and send to /login.
          auth.handleUnauthorized();
        } else if (error.status === 403) {
          // Authorization denial. The session stays VALID, so we must NOT log
          // the user out on a legitimate 403 — route them to /forbidden instead.
          //
          // Caveat: the backend may currently emit 403 (not 401) for a
          // missing/invalid token, i.e. an *unauthenticated* 403. We can only
          // treat a 403 as a pure authorization denial when we actually hold a
          // valid session; otherwise we fall back to the 401 path so the stale
          // session is cleared and the user re-authenticates.
          if (auth.isAuthenticated()) {
            void router.navigate(['/forbidden']);
          } else {
            auth.handleUnauthorized();
          }
        }
      }

      return throwError(() => error);
    }),
  );
};
