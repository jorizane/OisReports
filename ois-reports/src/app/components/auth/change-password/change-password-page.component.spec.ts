import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import { ChangePasswordPageComponent } from './change-password-page.component';

describe('ChangePasswordPageComponent', () => {
  let component: ChangePasswordPageComponent;
  let fixture: ComponentFixture<ChangePasswordPageComponent>;
  let changePasswordCalls: Array<{ currentPassword: string; newPassword: string }>;
  let changePasswordResult = of(void 0);
  const authServiceMock = {
    changePassword: (currentPassword: string, newPassword: string) => {
      changePasswordCalls.push({ currentPassword, newPassword });
      return changePasswordResult;
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordPageComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordPageComponent);
    component = fixture.componentInstance;
    changePasswordCalls = [];
    changePasswordResult = of(void 0);
    fixture.detectChanges();
  });

  it('shows validation message when fields are empty', () => {
    component['submit']();

    expect(component['errorMessage']()).toContain('Bitte alle Felder ausfüllen');
    expect(changePasswordCalls.length).toBe(0);
  });

  it('calls auth service and clears form on success', () => {
    component['currentPassword'] = 'old-password';
    component['newPassword'] = 'new-password';
    component['repeatPassword'] = 'new-password';

    component['submit']();

    expect(changePasswordCalls).toEqual([
      { currentPassword: 'old-password', newPassword: 'new-password' },
    ]);
    expect(component['successMessage']()).toContain('erfolgreich');
    expect(component['currentPassword']).toBe('');
  });

  it('shows error message on request failure', () => {
    changePasswordResult = throwError(() => new Error('request failed'));

    component['currentPassword'] = 'old-password';
    component['newPassword'] = 'new-password';
    component['repeatPassword'] = 'new-password';

    component['submit']();

    expect(component['errorMessage']()).toContain('konnte nicht geändert');
  });
});
