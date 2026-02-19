import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showPassword = signal(false);

  protected email = '';
  protected password = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  protected login(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.isLoading.set(false);
        this.router.navigateByUrl(redirect);
      },
      error: () => {
        this.errorMessage.set('Login fehlgeschlagen. Zugangsdaten prüfen.');
        this.isLoading.set(false);
      },
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((current) => !current);
  }
}
