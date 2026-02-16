import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ReportsStore } from './reports.store';

describe('ReportsStore', () => {
  let store: ReportsStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportsStore, provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(ReportsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads reports successfully', () => {
    store.loadReports();
    expect(store.isLoading()).toBe(true);

    const request = httpMock.expectOne('http://localhost:8000/reports');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        customer_id: 4,
        customer_name: 'Aqua Filters',
        filter_plant_id: 11,
        filter_plant_description: 'Filteranlage A',
        created_at: '2025-01-01T10:00:00Z',
        completed: true,
      },
    ]);

    expect(store.isLoading()).toBe(false);
    expect(store.errorMessage()).toBe('');
    expect(store.reports().length).toBe(1);
  });

  it('handles load errors', () => {
    store.loadReports();

    const request = httpMock.expectOne('http://localhost:8000/reports');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    expect(store.isLoading()).toBe(false);
    expect(store.errorMessage()).toBe('Berichte konnten nicht geladen werden.');
  });
});
