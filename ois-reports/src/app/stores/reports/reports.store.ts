import { Injectable, signal } from '@angular/core';

import { ReportRead, ReportsService } from '../../services/reports/reports.service';

@Injectable({ providedIn: 'root' })
export class ReportsStore {
  readonly reports = signal<ReportRead[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly reportsService: ReportsService) {}

  loadReports(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reportsService.listReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Berichte konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }
}
