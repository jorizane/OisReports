import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReportsPage } from './reports-page.component';

describe('ReportsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load reports', () => {
    const fixture = TestBed.createComponent(ReportsPage);
    fixture.detectChanges();

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

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('#1');
    expect(compiled.textContent).toContain('Aqua Filters');
    expect(compiled.textContent).toContain('Filteranlage A');
    expect(compiled.textContent).toContain('Abgeschlossen');
  });
});
