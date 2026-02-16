import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ClientsStore } from '../../../stores/clients/clients.store';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
})
export class ClientsPage implements OnInit {
  protected readonly clients;
  protected readonly isLoading;
  protected readonly errorMessage;
  protected readonly successMessage = signal('');
  protected newClientName = '';
  private successTimer: number | null = null;

  constructor(private readonly clientsStore: ClientsStore) {
    this.clients = this.clientsStore.clients;
    this.isLoading = this.clientsStore.isLoading;
    this.errorMessage = this.clientsStore.errorMessage;
  }

  ngOnInit(): void {
    this.clientsStore.loadClients();
  }

  addClient(): void {
    this.clientsStore.addClient(this.newClientName, () => {
      this.newClientName = '';
      this.showSuccess('Auftraggeber wurde angelegt.');
    });
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
