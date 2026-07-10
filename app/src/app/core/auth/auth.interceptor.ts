import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

function startsWithApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function isProtectedApiRequest(request: HttpRequest<unknown>, apiBaseUrl: string): boolean {
  const requestUrl = new URL(request.url, window.location.origin);

  if (!apiBaseUrl) {
    return requestUrl.origin === window.location.origin && startsWithApiPath(requestUrl.pathname);
  }

  const baseUrl = new URL(apiBaseUrl, window.location.origin);

  if (requestUrl.origin !== baseUrl.origin) {
    return false;
  }

  const basePath = baseUrl.pathname.replace(/\/$/, '');

  if (!basePath) {
    return startsWithApiPath(requestUrl.pathname);
  }

  return (
    requestUrl.pathname === `${basePath}/api` || requestUrl.pathname.startsWith(`${basePath}/api/`)
  );
}

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
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
      if (error instanceof HttpErrorResponse && error.status === 401 && isProtected) {
        auth.handleUnauthorized();
      }

      return throwError(() => error);
    }),
  );
};
