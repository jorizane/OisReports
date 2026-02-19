import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

export const apiAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiBaseUrl)) {
    return next(request);
  }

  return next(
    request.clone({
      withCredentials: true,
    })
  );
};
