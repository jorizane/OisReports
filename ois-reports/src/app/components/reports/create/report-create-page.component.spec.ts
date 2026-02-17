import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';

import { ReportCreatePage } from './report-create-page.component';

describe('ReportCreatePage', () => {
  let httpMock: HttpTestingController;
  let router: Router;

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
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load filter test fields for report', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Differenzdruck');
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    const component = fixture.componentInstance as ReportCreatePage & {
      saveReport: () => void;
      components: () => { id: number; value_number: number | null }[];
    };

    component.components.update((items) =>
      items.map((item) => (item.id === 5 ? { ...item, value_number: 12 } : item))
    );
    component.saveReport();

    const saveRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants/11/reports'
    );
    expect(saveRequest.request.method).toBe('POST');
    expect(saveRequest.request.body).toEqual({
      filter_values: [{ filter_test_field_id: 5, value_number: 12 }],
    });
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

  it('should show error when route params are missing', async () => {
    TestBed.resetTestingModule();
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
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReportCreatePage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage nicht gefunden.');
  });

  it('should show error when required fields are missing', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    const component = fixture.componentInstance as ReportCreatePage & {
      saveReport: () => void;
    };
    component.saveReport();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte alle Pflichtfelder ausfüllen.');
  });

  it('should handle filter test field load errors', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush({}, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Prüffelder konnten nicht geladen werden.');
  });

  it('should handle save errors', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    const component = fixture.componentInstance as ReportCreatePage & {
      saveReport: () => void;
      components: () => { id: number; value_number: number | null }[];
    };
    component.components.update((items) =>
      items.map((item) => (item.id === 5 ? { ...item, value_number: 12 } : item))
    );
    component.saveReport();

    const saveRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants/11/reports'
    );
    saveRequest.flush({}, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht konnte nicht gespeichert werden.');
  });

  it('should navigate back after save success', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    const navigateCalls: Array<[unknown[], unknown?]> = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push([args[0] as unknown[], args[1]]);
      return Promise.resolve(true);
    }) as Router['navigate'];

    const originalSetTimeout = window.setTimeout;
    window.setTimeout = ((cb: () => void) => {
      cb();
      return 0;
    }) as typeof window.setTimeout;

    const component = fixture.componentInstance as ReportCreatePage & {
      saveReport: () => void;
      components: () => { id: number; value_number: number | null }[];
    };
    component.components.update((items) =>
      items.map((item) => (item.id === 5 ? { ...item, value_number: 12 } : item))
    );
    component.saveReport();

    const saveRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants/11/reports'
    );
    saveRequest.flush({
      id: 1,
      customer_id: 4,
      filter_plant_id: 11,
      created_at: '2025-01-01T10:00:00Z',
      completed: false,
    });

    expect(navigateCalls[0]).toEqual([['/customers', 4, 'filter-plants', 11], undefined]);
    window.setTimeout = originalSetTimeout;
  });

  it('should render context and actions when data is loaded', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'radio',
        unit: 'Pa',
        options: '["A","B"]',
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auftraggeber A');
    const customerInput = compiled.querySelector(
      '.context input.field__input'
    ) as HTMLInputElement;
    expect(customerInput.value).toBe('Kunde A');
    const plantInput = compiled.querySelectorAll(
      '.context input.field__input'
    )[1] as HTMLInputElement;
    expect(plantInput.value).toBe('Filteranlage X');
    expect(compiled.textContent).toContain('Pflicht');
    expect(compiled.textContent).toContain('A');
    expect(compiled.textContent).toContain('B');

    const actionButton = compiled.querySelector('.actions .primary-button') as HTMLButtonElement;
    expect(actionButton).toBeTruthy();
    expect(actionButton.textContent).toContain('Bericht zwischenspeichern');
  });

  it('should hide actions when no components are available', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Bericht zwischenspeichern');
  });

  it('should show loading and error status messages', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([]);

    const component = fixture.componentInstance as ReportCreatePage & {
      isLoading: { set: (value: boolean) => void };
      errorMessage: { set: (value: string) => void };
    };
    component.isLoading.set(true);
    component.errorMessage.set('Testfehler');

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Prüffelder werden geladen...');
    expect(compiled.textContent).toContain('Testfehler');
  });

  it('should render text, number, radio and boolean inputs', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 1,
        filter_id: 11,
        label: 'Textfeld',
        field_type: 'text',
        unit: null,
        options: null,
        required: false,
        min_value: null,
        max_value: null,
      },
      {
        id: 2,
        filter_id: 11,
        label: 'Zahl',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: false,
        min_value: null,
        max_value: null,
      },
      {
        id: 3,
        filter_id: 11,
        label: 'Auswahl',
        field_type: 'radio',
        unit: null,
        options: '["A","B"]',
        required: false,
        min_value: null,
        max_value: null,
      },
      {
        id: 4,
        filter_id: 11,
        label: 'Ja/Nein',
        field_type: 'boolean',
        unit: null,
        options: null,
        required: false,
        min_value: null,
        max_value: null,
      },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.field__textarea')).toBeTruthy();
    expect(compiled.querySelector('input.field__input[type="number"]')).toBeTruthy();
    expect(compiled.querySelectorAll('.radio-group input[type="radio"]').length).toBe(2);
    expect(compiled.querySelector('.checkbox input[type="checkbox"]')).toBeTruthy();
  });

  it('should dismiss success modal', () => {
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

    const request = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/filter-test-fields'
    );
    request.flush([
      {
        id: 5,
        filter_id: 11,
        label: 'Differenzdruck',
        field_type: 'number',
        unit: 'Pa',
        options: null,
        required: true,
        min_value: null,
        max_value: null,
      },
    ]);

    const component = fixture.componentInstance as ReportCreatePage & {
      saveReport: () => void;
      components: () => { id: number; value_number: number | null }[];
    };
    component.components.update((items) =>
      items.map((item) => (item.id === 5 ? { ...item, value_number: 12 } : item))
    );
    component.saveReport();

    const saveRequest = httpMock.expectOne(
      'http://localhost:8000/customers/4/filter-plants/11/reports'
    );
    saveRequest.flush({
      id: 1,
      customer_id: 4,
      filter_plant_id: 11,
      created_at: '2025-01-01T10:00:00Z',
      completed: false,
    });

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht wurde zwischengespeichert.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Bericht wurde zwischengespeichert.');
  });
});
