import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  ReportComponentRead,
  ReportDetailRead,
  ReportsService,
} from '../../../services/reports/reports.service';

type ComponentInput = ReportComponentRead & { description: string };

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
          report.components.map((component) => ({
            ...component,
            description: component.description,
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

    const payload = this.components().map((component) => ({
      component_id: component.component_id,
      description: component.description.trim(),
    }));

    if (payload.some((item) => !item.description)) {
      this.errorMessage.set('Bitte alle Beschreibungen ausfüllen.');
      return;
    }

    this.reportsService
      .updateReport(report.id, { completed: this.completed, component_descriptions: payload })
      .subscribe({
        next: (updated) => {
          this.report.set(updated);
          this.completed = updated.completed;
          this.components.set(
            updated.components.map((component) => ({
              ...component,
              description: component.description,
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
}
