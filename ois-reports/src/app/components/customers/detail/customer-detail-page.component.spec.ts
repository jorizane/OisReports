import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { CustomerDetailPage } from './customer-detail-page.component';

describe('CustomerDetailPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '4' }),
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

  it('should load customer details', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 4, name: 'Aqua Filters' });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    expect(plantsRequest.request.method).toBe('GET');
    plantsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(manufacturersRequest.request.method).toBe('GET');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    expect(reportsRequest.request.method).toBe('GET');
    reportsRequest.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aqua Filters');
    expect(compiled.textContent).toContain('#4');
  });

  it('should create a filter plant', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters' });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([]);

    const component = fixture.componentInstance as CustomerDetailPage & {
      plantDescription: string;
      plantYear: number | null;
      selectedManufacturerId: number | null;
      togglePlantForm: () => void;
      createFilterPlant: () => void;
    };

    component.togglePlantForm();
    component.plantDescription = 'Industriefilter A';
    component.plantYear = 2020;
    component.selectedManufacturerId = 7;
    component.createFilterPlant();

    const createRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({
      description: 'Industriefilter A',
      year_built: 2020,
      manufacturer_id: 7,
    });
    createRequest.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 7,
      description: 'Industriefilter A',
      year_built: 2020,
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Industriefilter A');
    expect(compiled.textContent).toContain('Details');
    expect(compiled.textContent).toContain('Bericht erstellen');
  });

  it('should show plant success popup', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters' });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([]);

    const component = fixture.componentInstance as CustomerDetailPage & {
      plantDescription: string;
      plantYear: number | null;
      selectedManufacturerId: number | null;
      togglePlantForm: () => void;
      createFilterPlant: () => void;
    };

    component.togglePlantForm();
    component.plantDescription = 'Filteranlage Test';
    component.plantYear = 2021;
    component.selectedManufacturerId = 3;
    component.createFilterPlant();

    const createRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    createRequest.flush({
      id: 14,
      customer_id: 4,
      manufacturer_id: 3,
      description: 'Filteranlage Test',
      year_built: 2021,
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage wurde angelegt.');
  });
});
