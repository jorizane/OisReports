import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { FilterPlantDetailPage } from './filter-plant-detail-page.component';

describe('FilterPlantDetailPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPlantDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '5', plantId: '11' }),
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

  it('should load filter plant details', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    expect(componentsRequest.request.method).toBe('GET');
    componentsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(manufacturersRequest.request.method).toBe('GET');
    manufacturersRequest.flush([{ id: 3, name: 'FilterTech' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage A');
    expect(compiled.textContent).toContain('FilterTech');
    expect(compiled.textContent).toContain('2022');
  });

  it('should create a component', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const component = fixture.componentInstance as FilterPlantDetailPage & {
      componentName: string;
      toggleComponentForm: () => void;
      createComponent: () => void;
    };

    component.toggleComponentForm();
    component.componentName = 'Ventil A';
    component.createComponent();

    const createRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Ventil A' });
    createRequest.flush({ id: 9, filter_plant_id: 11, name: 'Ventil A' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ventil A');
  });

  it('should show validation error when component name is missing', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const component = fixture.componentInstance as FilterPlantDetailPage & {
      createComponent: () => void;
    };
    component.createComponent();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte einen Namen eingeben.');
  });

  it('should show empty state for components list', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Noch keine Komponenten.');
  });

  it('should show component success modal and dismiss it', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const component = fixture.componentInstance as FilterPlantDetailPage & {
      componentName: string;
      createComponent: () => void;
    };
    component.componentName = 'Ventil X';
    component.createComponent();

    const createRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    createRequest.flush({ id: 9, filter_plant_id: 11, name: 'Ventil X' });

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Komponente wurde angelegt.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Komponente wurde angelegt.');
  });

  it('should render components list when available', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([{ id: 9, filter_plant_id: 11, name: 'Ventil A' }]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 3, name: 'FilterTech' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ventil A');
    expect(compiled.textContent).toContain('Details');
  });

  it('should toggle component form via cancel button', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      manufacturer_id: 3,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([]);

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const component = fixture.componentInstance as FilterPlantDetailPage & {
      toggleComponentForm: () => void;
    };
    component.toggleComponentForm();

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form.components__form')).toBeTruthy();

    const cancelButton = compiled.querySelector(
      'form.components__form .ghost-link-button'
    ) as HTMLButtonElement;
    cancelButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form.components__form')).toBeFalsy();
  });
});
