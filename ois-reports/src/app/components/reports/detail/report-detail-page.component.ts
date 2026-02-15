import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

import {
  FilterReportValueRead,
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

  protected formatValue(field: FilterReportValueRead): string {
    if (field.field_type === 'number') {
      return field.value_number !== null ? String(field.value_number) : '—';
    }
    if (field.field_type === 'radio') {
      return field.value_option?.trim() ? field.value_option : '—';
    }
    if (field.field_type === 'boolean') {
      if (field.value_bool === null) {
        return '—';
      }
      return field.value_bool ? 'Ja' : 'Nein';
    }
    return field.value_text?.trim() ? field.value_text : '—';
  }

  protected reportPdfUrl(reportId: number | null | undefined): string {
    if (!reportId) {
      return '#';
    }
    return `${environment.apiBaseUrl}/reports/${reportId}/pdf`;
  }
}
