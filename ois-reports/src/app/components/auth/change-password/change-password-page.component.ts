import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password-page.component.html',
  styleUrl: './change-password-page.component.scss',
})
export class ChangePasswordPageComponent {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected currentPassword = '';
  protected newPassword = '';
  protected repeatPassword = '';

  constructor(private readonly authService: AuthService) {}

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.currentPassword.trim() || !this.newPassword.trim() || !this.repeatPassword.trim()) {
      this.errorMessage.set('Bitte alle Felder ausfüllen.');
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage.set('Neues Passwort muss mindestens 8 Zeichen haben.');
      return;
    }

    if (this.newPassword !== this.repeatPassword) {
      this.errorMessage.set('Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    this.isLoading.set(true);
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.successMessage.set('Passwort erfolgreich geändert.');
        this.currentPassword = '';
        this.newPassword = '';
        this.repeatPassword = '';
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage =
          typeof error.error?.detail === 'string' ? error.error.detail : null;
        if (backendMessage) {
          this.errorMessage.set(backendMessage);
        } else if (error.status === 401) {
          this.errorMessage.set('Sitzung abgelaufen. Bitte neu anmelden.');
        } else {
          this.errorMessage.set('Passwort konnte nicht geändert werden.');
        }
        this.isLoading.set(false);
      },
    });
  }
}
