import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

export type AuthUser = {
  id: number;
  email: string;
  role: string;
};

type LoginResponse = {
  user: AuthUser;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly restoreCheckedSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly restoreChecked = this.restoreCheckedSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  restoreSession(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.baseUrl}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUserSignal.set(user);
          this.restoreCheckedSignal.set(true);
        }),
        catchError((error) => {
          this.currentUserSignal.set(null);
          this.restoreCheckedSignal.set(true);
          return throwError(() => error);
        })
      );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/auth/login`,
        { email, password },
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((result) => result.user),
        tap((user) => {
          this.currentUserSignal.set(user);
          this.restoreCheckedSignal.set(true);
        })
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.baseUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.currentUserSignal.set(null);
          this.restoreCheckedSignal.set(true);
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/auth/change-password`,
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        withCredentials: true,
      }
    );
  }
}
