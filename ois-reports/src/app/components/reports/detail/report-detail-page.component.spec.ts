import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ReportDetailPage } from './report-detail-page.component';

describe('ReportDetailPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ reportId: '7' }),
            },
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load report details', () => {
    const fixture = TestBed.createComponent(ReportDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/reports/7');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 7,
      customer_id: 3,
      customer_name: 'Aqua Filters',
      filter_plant_id: 10,
      filter_plant_description: 'Filteranlage X',
      created_at: '2025-01-01T10:00:00Z',
      completed: true,
      filter_values: [
        {
          filter_test_field_id: 4,
          label: 'Differenzdruck',
          field_type: 'number',
          unit: 'Pa',
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: 10,
          value_option: null,
          value_bool: null,
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Berichtsdetails');
    expect(compiled.textContent).toContain('#7');
    expect(compiled.textContent).toContain('Aqua Filters');
    expect(compiled.textContent).toContain('Differenzdruck');
    expect(compiled.textContent).toContain('10');
    expect(compiled.textContent).toContain('Abgeschlossen');
  });
});
