import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows validation message for empty credentials', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance as LoginPageComponent & {
      login: () => void;
    };

    component.login();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte E-Mail und Passwort eingeben.');
  });

  it('submits login request', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance as LoginPageComponent & {
      email: string;
      password: string;
      login: () => void;
    };

    component.email = 'admin@local';
    component.password = 'password';
    component.login();

    const request = httpMock.expectOne('http://localhost:8000/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'admin@local', password: 'password' });
    request.flush({ user: { id: 1, email: 'admin@local', role: 'admin' } });
  });

  it('toggles password visibility', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
    const toggleButton = compiled.querySelector('.password-toggle') as HTMLButtonElement;

    expect(passwordInput.type).toBe('password');
    toggleButton.click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('text');
    toggleButton.click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('password');
  });
});
