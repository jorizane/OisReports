import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ReportCreatePage } from './report-create-page.component';

describe('ReportCreatePage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '4', plantId: '11' }),
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

  it('should load components for report', () => {
    const fixture = TestBed.createComponent(ReportCreatePage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    expect(clientsRequest.request.method).toBe('GET');
    clientsRequest.flush([{ id: 1, name: 'Auftraggeber A' }]);

    const customerRequest = httpMock.expectOne('http://localhost:8000/customers/4');
    expect(customerRequest.request.method).toBe('GET');
    customerRequest.flush({ id: 4, name: 'Kunde A', client_id: 1 });

    const plantRequest = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    expect(plantRequest.request.method).toBe('GET');
    plantRequest.flush({
      id: 11,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2020,
    });

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11/components');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 5, filter_plant_id: 11, name: 'Pumpe A' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pumpe A');
  });

  it('should save report', () => {
    const fixture = TestBed.createComponent(ReportCreatePage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 1, name: 'Auftraggeber A' }]);

    const customerRequest = httpMock.expectOne('http://localhost:8000/customers/4');
    customerRequest.flush({ id: 4, name: 'Kunde A', client_id: 1 });

    const plantRequest = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    plantRequest.flush({
      id: 11,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2020,
    });

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11/components');
    request.flush([{ id: 5, filter_plant_id: 11, name: 'Pumpe A' }]);

    const component = fixture.componentInstance as ReportCreatePage & {
      saveReport: () => void;
      components: () => { id: number; name: string; description: string }[];
    };

    component.components.update((items) =>
      items.map((item) => (item.id === 5 ? { ...item, description: 'Alles ok' } : item))
    );
    component.saveReport();

    const saveRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants/11/reports'
    );
    expect(saveRequest.request.method).toBe('POST');
    saveRequest.flush({
      id: 1,
      customer_id: 4,
      filter_plant_id: 11,
      created_at: '2025-01-01T10:00:00Z',
      completed: false,
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht wurde zwischengespeichert.');
  });
});
