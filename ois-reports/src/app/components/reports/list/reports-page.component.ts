import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReportsStore } from '../../../stores/reports/reports.store';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPage implements OnInit {
  protected readonly reports;
  protected readonly isLoading;
  protected readonly errorMessage;

  constructor(private readonly reportsStore: ReportsStore) {
    this.reports = this.reportsStore.reports;
    this.isLoading = this.reportsStore.isLoading;
    this.errorMessage = this.reportsStore.errorMessage;
  }

  ngOnInit(): void {
    this.reportsStore.loadReports();
  }
}
