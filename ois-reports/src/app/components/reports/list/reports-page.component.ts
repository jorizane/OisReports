import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReportsService, ReportRead } from '../../../services/reports/reports.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPage implements OnInit {
  protected readonly reports = signal<ReportRead[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor(private readonly reportsService: ReportsService) {}

  ngOnInit(): void {
    this.isLoading.set(true);
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
