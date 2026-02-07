import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  FilterReportValueRead,
  ReportDetailRead,
  ReportsService,
} from '../../../services/reports/reports.service';

type ComponentInput = FilterReportValueRead & {
  value_text: string | null;
  value_number: number | null;
  value_option: string | null;
  value_bool: boolean | null;
};

@Component({
  selector: 'app-report-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './report-edit-page.component.html',
  styleUrl: './report-edit-page.component.scss',
})
export class ReportEditPage implements OnInit {
  protected readonly report = signal<ReportDetailRead | null>(null);
  protected readonly components = signal<ComponentInput[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected completed = false;
  private successTimer: number | null = null;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
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
        this.completed = report.completed;
        this.components.set(
          report.filter_values.map((field) => ({
            ...field,
            value_text: field.value_text ?? '',
            value_number: field.value_number ?? null,
            value_option: field.value_option ?? '',
            value_bool: field.value_bool ?? null,
          }))
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Bericht nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }

  saveReport(): void {
    const report = this.report();
    if (!report) {
      return;
    }

    if (report.completed) {
      this.errorMessage.set('Bericht ist abgeschlossen und kann nicht bearbeitet werden.');
      return;
    }

    const payload = this.components().map((field) => {
      if (field.field_type === 'number') {
        return {
          filter_test_field_id: field.filter_test_field_id,
          value_number: field.value_number,
        };
      }
      if (field.field_type === 'radio') {
        return {
          filter_test_field_id: field.filter_test_field_id,
          value_option: field.value_option,
        };
      }
      if (field.field_type === 'boolean') {
        return {
          filter_test_field_id: field.filter_test_field_id,
          value_bool: field.value_bool,
        };
      }
      return {
        filter_test_field_id: field.filter_test_field_id,
        value_text: (field.value_text ?? '').trim(),
      };
    });

    if (
      this.components().some(
        (field) =>
          field.required &&
          ((field.field_type === 'text' && !(field.value_text ?? '').trim()) ||
            (field.field_type === 'number' && field.value_number === null) ||
            (field.field_type === 'radio' && !field.value_option) ||
            (field.field_type === 'boolean' && field.value_bool === null))
      )
    ) {
      this.errorMessage.set('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }

    this.reportsService
      .updateReport(report.id, { completed: this.completed, filter_values: payload })
      .subscribe({
        next: (updated) => {
          this.report.set(updated);
          this.completed = updated.completed;
          this.components.set(
            updated.filter_values.map((field) => ({
              ...field,
              value_text: field.value_text ?? '',
              value_number: field.value_number ?? null,
              value_option: field.value_option ?? '',
              value_bool: field.value_bool ?? null,
            }))
          );
          this.showSuccess('Bericht wurde aktualisiert.');
          if (updated.completed) {
            window.setTimeout(() => {
              this.router.navigate(['/reports', updated.id]);
            }, 800);
          }
        },
        error: () => {
          this.errorMessage.set('Bericht konnte nicht aktualisiert werden.');
        },
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

  protected optionsFor(field: FilterReportValueRead): string[] {
    if (!field.options) {
      return [];
    }
    try {
      const parsed = JSON.parse(field.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
