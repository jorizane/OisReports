import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';

import { ReportEditPage } from './report-edit-page.component';

describe('ReportEditPage', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    TestBed.resetTestingModule();
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
    router = TestBed.inject(Router);
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

  it('should block saving completed reports', () => {
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
      completed: true,
      filter_values: [],
    });

    const component = fixture.componentInstance as ReportEditPage & {
      saveReport: () => void;
    };
    component.saveReport();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht ist abgeschlossen');
  });

  it('should show validation error for missing required fields', () => {
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
          value_text: '',
          value_number: null,
          value_option: null,
          value_bool: null,
        },
      ],
    });

    const component = fixture.componentInstance as ReportEditPage & {
      saveReport: () => void;
    };
    component.saveReport();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte alle Pflichtfelder ausfüllen.');
  });

  it('should navigate to detail when marked completed', () => {
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
          field_type: 'boolean',
          unit: null,
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: null,
          value_option: null,
          value_bool: false,
        },
      ],
    });

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

    const component = fixture.componentInstance as ReportEditPage & {
      completed: boolean;
      saveReport: () => void;
    };
    component.completed = true;
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
      completed: true,
      filter_values: [
        {
          filter_test_field_id: 12,
          label: 'Dichtheit',
          field_type: 'boolean',
          unit: null,
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: null,
          value_option: null,
          value_bool: false,
        },
      ],
    });

    expect(navigateCalls[0]).toEqual([['/reports', 7], undefined]);
    window.setTimeout = originalSetTimeout;
  });

  it('should parse options safely', () => {
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
      filter_values: [],
    });

    const component = fixture.componentInstance as ReportEditPage & {
      optionsFor: (field: { options: string | null }) => string[];
    };

    expect(component.optionsFor({ options: '["A","B"]' })).toEqual(['A', 'B']);
    expect(component.optionsFor({ options: 'invalid' })).toEqual([]);
    expect(component.optionsFor({ options: null })).toEqual([]);
  });

  it('should render required pills, options, and disabled inputs when completed', () => {
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
      completed: true,
      filter_values: [
        {
          filter_test_field_id: 1,
          label: 'Druck',
          field_type: 'number',
          unit: 'Pa',
          options: null,
          required: true,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: 5,
          value_option: null,
          value_bool: null,
        },
        {
          filter_test_field_id: 2,
          label: 'Status',
          field_type: 'radio',
          unit: null,
          options: '["A","B"]',
          required: false,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: null,
          value_option: 'A',
          value_bool: null,
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Pflicht');
    expect(compiled.textContent).toContain('A');
    expect(compiled.textContent).toContain('B');
    expect(compiled.textContent).toContain('Bericht ist abgeschlossen');

    const saveButton = compiled.querySelector('.actions .primary-button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('should show error when report id is missing', async () => {
    TestBed.resetTestingModule();
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
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReportEditPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht nicht gefunden.');
  });

  it('should dismiss success modal', () => {
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
      saveReport: () => void;
      components: () => { filter_test_field_id: number; value_text: string }[];
    };
    component.components.update((items) =>
      items.map((item) =>
        item.filter_test_field_id === 12 ? { ...item, value_text: 'Neu' } : item
      )
    );
    component.saveReport();

    const updateRequest = httpMock.expectOne('http://localhost:8000/reports/7');
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
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht wurde aktualisiert.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Bericht wurde aktualisiert.');
  });

  it('should show loading and error status messages', () => {
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
      filter_values: [],
    });

    const component = fixture.componentInstance as ReportEditPage & {
      isLoading: { set: (value: boolean) => void };
      errorMessage: { set: (value: string) => void };
    };
    component.isLoading.set(true);
    component.errorMessage.set('Testfehler');

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bericht wird geladen...');
    expect(compiled.textContent).toContain('Testfehler');
  });

  it('should render text, number, radio and boolean inputs', () => {
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
          filter_test_field_id: 1,
          label: 'Textfeld',
          field_type: 'text',
          unit: null,
          options: null,
          required: false,
          min_value: null,
          max_value: null,
          value_text: 'OK',
          value_number: null,
          value_option: null,
          value_bool: null,
        },
        {
          filter_test_field_id: 2,
          label: 'Zahl',
          field_type: 'number',
          unit: 'Pa',
          options: null,
          required: false,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: 10,
          value_option: null,
          value_bool: null,
        },
        {
          filter_test_field_id: 3,
          label: 'Auswahl',
          field_type: 'radio',
          unit: null,
          options: '["A","B"]',
          required: false,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: null,
          value_option: 'A',
          value_bool: null,
        },
        {
          filter_test_field_id: 4,
          label: 'Ja/Nein',
          field_type: 'boolean',
          unit: null,
          options: null,
          required: false,
          min_value: null,
          max_value: null,
          value_text: null,
          value_number: null,
          value_option: null,
          value_bool: true,
        },
      ],
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.field__textarea')).toBeTruthy();
    expect(compiled.querySelector('input.field__input[type="number"]')).toBeTruthy();
    expect(compiled.querySelectorAll('.radio-group input[type="radio"]').length).toBe(2);
    expect(compiled.querySelector('.checkbox input[type="checkbox"]')).toBeTruthy();
  });
});
