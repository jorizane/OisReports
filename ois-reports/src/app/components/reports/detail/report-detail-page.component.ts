import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  ReportDetailRead,
  ReportsService,
} from '../../../services/reports/reports.service';

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-detail-page.component.html',
  styleUrl: './report-detail-page.component.scss',
})
export class ReportDetailPage implements OnInit {
  protected readonly report = signal<ReportDetailRead | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor(
    private readonly reportsService: ReportsService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const reportIdParam = this.route.snapshot.paramMap.get('reportId');
    const reportId = reportIdParam ? Number(reportIdParam) : null;
    if (!reportId) {
      this.errorMessage.set('Bericht nicht gefunden.');
      return;
    }

    this.isLoading.set(true);
    this.reportsService.getReport(reportId).subscribe({
      next: (report) => {
        this.report.set(report);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Bericht nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }
}
