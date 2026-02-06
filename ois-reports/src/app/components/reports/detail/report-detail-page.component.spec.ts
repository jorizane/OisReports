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
      components: [
        {
          component_id: 99,
          component_name: 'Messpunkt A',
          description: 'Alles ok',
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Berichtsdetails');
    expect(compiled.textContent).toContain('#7');
    expect(compiled.textContent).toContain('Aqua Filters');
    expect(compiled.textContent).toContain('Messpunkt A');
    expect(compiled.textContent).toContain('Alles ok');
    expect(compiled.textContent).toContain('Abgeschlossen');
  });
});
