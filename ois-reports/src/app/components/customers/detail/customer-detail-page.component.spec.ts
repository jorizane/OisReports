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
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    expect(plantsRequest.request.method).toBe('GET');
    plantsRequest.flush([
      {
        id: 12,
        customer_id: 4,
        manufacturer_id: 7,
        description: 'Industriefilter A',
        year_built: 2020,
      },
    ]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    expect(clientsRequest.request.method).toBe('GET');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(manufacturersRequest.request.method).toBe('GET');
    manufacturersRequest.flush([{ id: 7, name: 'FilterTech' }]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    expect(reportsRequest.request.method).toBe('GET');
    reportsRequest.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aqua Filters');
    expect(compiled.textContent).toContain('#4');
    expect(compiled.textContent).toContain('Auftraggeber A');
    expect(compiled.textContent).toContain('FilterTech');
  });

  it('should create a filter plant', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([
      {
        id: 12,
        customer_id: 4,
        manufacturer_id: 7,
        description: 'Industriefilter A',
        year_built: 2020,
      },
    ]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 7, name: 'FilterTech' }]);

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
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([
      {
        id: 12,
        customer_id: 4,
        manufacturer_id: 7,
        description: 'Industriefilter A',
        year_built: 2020,
      },
    ]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 7, name: 'FilterTech' }]);

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

  it('should show validation errors for invalid plant input', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 7, name: 'FilterTech' }]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([]);

    const component = fixture.componentInstance as CustomerDetailPage & {
      plantDescription: string;
      plantYear: number | null;
      selectedManufacturerId: number | null;
      createFilterPlant: () => void;
    };

    component.createFilterPlant();
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte eine Beschreibung eingeben.');

    component.plantDescription = 'Test';
    component.plantYear = 1700;
    component.selectedManufacturerId = 7;
    component.createFilterPlant();
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte ein gültiges Baujahr eingeben.');

    component.plantYear = 2020;
    component.selectedManufacturerId = null;
    component.createFilterPlant();
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte einen Hersteller auswählen.');
  });

  it('should show empty states for plants and reports', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Noch keine Filteranlagen.');
    expect(compiled.textContent).toContain('Noch keine Berichte vorhanden.');
  });

  it('should render reports list when available', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([
      {
        id: 5,
        customer_id: 4,
        filter_plant_id: 11,
        filter_plant_description: 'Filteranlage Z',
        created_at: '2025-01-01T10:00:00Z',
        completed: false,
      },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht #5');
    expect(compiled.textContent).toContain('Filteranlage Z');
    expect(compiled.textContent).toContain('Bericht öffnen');
  });

  it('should toggle plant form via cancel button', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 7, name: 'FilterTech' }]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([]);

    const component = fixture.componentInstance as CustomerDetailPage & {
      togglePlantForm: () => void;
    };
    component.togglePlantForm();

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form.plants__form')).toBeTruthy();

    const cancelButton = compiled.querySelector(
      'form.plants__form .ghost-link-button'
    ) as HTMLButtonElement;
    cancelButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form.plants__form')).toBeFalsy();
  });

  it('should show report error on failure', () => {
    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush({}, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Berichte konnten nicht geladen werden.');
  });

  it('should show deleted plant success from history state and dismiss modal', () => {
    window.history.replaceState({ deletedPlant: 'Altanlage' }, '');

    const fixture = TestBed.createComponent(CustomerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers/4');
    request.flush({ id: 4, name: 'Aqua Filters', client_id: 21 });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants'
    );
    plantsRequest.flush([]);

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 21, name: 'Auftraggeber A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const reportsRequest = httpMock.expectOne('http://localhost:8000/customers/4/reports');
    reportsRequest.flush([]);

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage "Altanlage" wurde gelöscht.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Filteranlage "Altanlage" wurde gelöscht.');
  });
});
