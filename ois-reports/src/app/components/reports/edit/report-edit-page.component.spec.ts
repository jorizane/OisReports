import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ReportEditPage } from './report-edit-page.component';

describe('ReportEditPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportEditPage],
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

  it('should load report for editing', () => {
    const fixture = TestBed.createComponent(ReportEditPage);
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
      completed: false,
      filter_values: [
        {
          filter_test_field_id: 12,
          label: 'Differenzdruck',
          field_type: 'number',
          unit: 'Pa',
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: 8,
          value_option: null,
          value_bool: null,
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht bearbeiten');
    expect(compiled.textContent).toContain('Differenzdruck');
  });

  it('should update report', () => {
    const fixture = TestBed.createComponent(ReportEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/reports/7');
    request.flush({
      id: 7,
      customer_id: 3,
      customer_name: 'Aqua Filters',
      filter_plant_id: 10,
      filter_plant_description: 'Filteranlage X',
      created_at: '2025-01-01T10:00:00Z',
      completed: false,
      filter_values: [
        {
          filter_test_field_id: 12,
          label: 'Dichtheit',
          field_type: 'text',
          unit: null,
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: 'Alles ok',
          value_number: null,
          value_option: null,
          value_bool: null,
        },
      ],
    });

    const component = fixture.componentInstance as ReportEditPage & {
      components: () => { filter_test_field_id: number; value_text: string }[];
      saveReport: () => void;
    };

    component.components.update((items) =>
      items.map((item) =>
        item.filter_test_field_id === 12 ? { ...item, value_text: 'Neu' } : item
      )
    );
    component.saveReport();

    const updateRequest = httpMock.expectOne('http://localhost:8000/reports/7');
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual({
      completed: false,
      filter_values: [{ filter_test_field_id: 12, value_text: 'Neu' }],
    });
    updateRequest.flush({
      id: 7,
      customer_id: 3,
      customer_name: 'Aqua Filters',
      filter_plant_id: 10,
      filter_plant_description: 'Filteranlage X',
      created_at: '2025-01-01T10:00:00Z',
      completed: false,
      filter_values: [
        {
          filter_test_field_id: 12,
          label: 'Dichtheit',
          field_type: 'text',
          unit: null,
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: 'Neu',
          value_number: null,
          value_option: null,
          value_bool: null,
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht wurde aktualisiert.');
  });
});
