import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('restores session and marks user as authenticated', () => {
    service.restoreSession().subscribe();

    const request = httpMock.expectOne('http://localhost:8000/auth/me');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ id: 1, email: 'admin@local', role: 'admin' });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({ id: 1, email: 'admin@local', role: 'admin' });
  });

  it('logs in and stores current user', () => {
    service.login('admin@local', 'password').subscribe();

    const request = httpMock.expectOne('http://localhost:8000/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'admin@local', password: 'password' });
    request.flush({ user: { id: 1, email: 'admin@local', role: 'admin' } });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('admin@local');
  });

  it('logs out and clears current user', () => {
    service.login('admin@local', 'password').subscribe();
    const loginRequest = httpMock.expectOne('http://localhost:8000/auth/login');
    loginRequest.flush({ user: { id: 1, email: 'admin@local', role: 'admin' } });

    service.logout().subscribe();
    const logoutRequest = httpMock.expectOne('http://localhost:8000/auth/logout');
    expect(logoutRequest.request.method).toBe('POST');
    logoutRequest.flush({});

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});
