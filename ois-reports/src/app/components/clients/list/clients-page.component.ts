import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Client, ClientsService } from '../../../services/clients/clients.service';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
})
export class ClientsPage implements OnInit {
  protected readonly clients = signal<Client[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected newClientName = '';

  constructor(private readonly clientsService: ClientsService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientsService.listClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  addClient(): void {
    const name = this.newClientName.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Auftraggebernamen eingeben.');
      return;
    }

    this.clientsService.createClient(name).subscribe({
      next: (client) => {
        this.clients.update((items) => [...items, client]);
        this.newClientName = '';
        this.errorMessage.set('');
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnte nicht angelegt werden.');
      },
    });
  }
}
