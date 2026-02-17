import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ClientsStore } from '../../../stores/clients/clients.store';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
})
export class ClientsPage implements OnInit {
  protected readonly clients;
  protected readonly isLoading;
  protected readonly errorMessage;
  protected readonly successMessage = signal('');
  private successTimer: number | null = null;

  constructor(private readonly clientsStore: ClientsStore) {
    this.clients = this.clientsStore.clients;
    this.isLoading = this.clientsStore.isLoading;
    this.errorMessage = this.clientsStore.errorMessage;
  }

  ngOnInit(): void {
    const state = window.history.state as { createdClient?: string };
    if (state?.createdClient) {
      this.showSuccess(`Auftraggeber "${state.createdClient}" wurde angelegt.`);
    }
    this.clientsStore.loadClients();
  }

  dismissSuccess(): void {
    this.clearSuccess();
  }

  private showSuccess(message: string): void {
    this.clearSuccess();
    this.successMessage.set(message);
    this.successTimer = window.setTimeout(() => {
      this.clearSuccess();
    }, 2200);
  }

  private clearSuccess(): void {
    if (this.successTimer !== null) {
      window.clearTimeout(this.successTimer);
      this.successTimer = null;
    }
    this.successMessage.set('');
  }
}
