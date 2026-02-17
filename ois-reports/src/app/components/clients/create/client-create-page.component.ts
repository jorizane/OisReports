import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ClientsService } from '../../../services/clients/clients.service';

@Component({
  selector: 'app-client-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-create-page.component.html',
  styleUrl: './client-create-page.component.scss',
})
export class ClientCreatePage {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected name = '';

  constructor(
    private readonly clientsService: ClientsService,
    private readonly router: Router
  ) {}

  saveClient(): void {
    const name = this.name.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Auftraggebernamen eingeben.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientsService.createClient(name).subscribe({
      next: (client) => {
        this.isLoading.set(false);
        this.router.navigate(['/clients'], {
          state: { createdClient: client.name },
        });
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnte nicht angelegt werden.');
        this.isLoading.set(false);
      },
    });
  }
}
