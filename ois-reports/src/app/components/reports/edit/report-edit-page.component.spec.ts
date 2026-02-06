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
    expect(compiled.textContent).toContain('Bericht bearbeiten');
    expect(compiled.textContent).toContain('Messpunkt A');
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
      components: [
        {
          component_id: 99,
          component_name: 'Messpunkt A',
          description: 'Alles ok',
        },
      ],
    });

    const component = fixture.componentInstance as ReportEditPage & {
      components: () => { component_id: number; description: string }[];
      saveReport: () => void;
    };

    component.components.update((items) =>
      items.map((item) => (item.component_id === 99 ? { ...item, description: 'Neu' } : item))
    );
    component.saveReport();

    const updateRequest = httpMock.expectOne('http://localhost:8000/reports/7');
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({
      id: 7,
      customer_id: 3,
      customer_name: 'Aqua Filters',
      filter_plant_id: 10,
      filter_plant_description: 'Filteranlage X',
      created_at: '2025-01-01T10:00:00Z',
      completed: false,
      components: [
        {
          component_id: 99,
          component_name: 'Messpunkt A',
          description: 'Neu',
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht wurde aktualisiert.');
  });
});
