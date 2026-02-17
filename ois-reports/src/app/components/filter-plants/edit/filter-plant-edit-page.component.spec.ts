import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';

import { FilterPlantEditPage } from './filter-plant-edit-page.component';

describe('FilterPlantEditPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPlantEditPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ plantId: '12' }),
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

  it('should load filter plant for editing', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2015,
    });

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(manufacturersRequest.request.method).toBe('GET');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage X');
  });

  it('should update filter plant', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    request.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2015,
    });

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    const component = fixture.componentInstance as FilterPlantEditPage & {
      description: string;
      yearBuilt: number | null;
      selectedManufacturerId: number | null;
      saveChanges: () => void;
    };

    component.description = 'Filteranlage X2';
    component.yearBuilt = 2018;
    component.selectedManufacturerId = 2;
    component.saveChanges();

    const updateRequest = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual({
      description: 'Filteranlage X2',
      year_built: 2018,
      manufacturer_id: 2,
    });
    updateRequest.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X2',
      year_built: 2018,
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage X2');
  });

  it('should delete filter plant after confirmation', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    request.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2015,
    });

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([]);

    const component = fixture.componentInstance as FilterPlantEditPage & {
      promptDelete: () => void;
      confirmDelete: () => void;
    };

    component.promptDelete();
    component.confirmDelete();

    const deleteRequest = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });

  it('should cancel delete when overlay is clicked', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    request.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2015,
    });

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    const component = fixture.componentInstance as FilterPlantEditPage & {
      promptDelete: () => void;
    };
    component.promptDelete();

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal')).toBeTruthy();

    const overlay = compiled.querySelector('.modal__overlay') as HTMLDivElement;
    overlay.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal')).toBeFalsy();
  });

  it('should dismiss success modal', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    request.flush({
      id: 12,
      customer_id: 4,
      manufacturer_id: 2,
      description: 'Filteranlage X',
      year_built: 2015,
    });

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    const component = fixture.componentInstance as FilterPlantEditPage & {
      promptDelete: () => void;
      confirmDelete: () => void;
    };
    component.promptDelete();
    component.confirmDelete();

    const deleteRequest = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    deleteRequest.flush(null);

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage wurde gelöscht.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Filteranlage wurde gelöscht.');
  });
});

describe('FilterPlantEditPage (create mode)', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPlantEditPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '5' }),
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

  it('should show validation error for invalid year', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    const component = fixture.componentInstance as FilterPlantEditPage & {
      description: string;
      yearBuilt: number | null;
      selectedManufacturerId: number | null;
      saveChanges: () => void;
    };

    component.description = 'Neue Anlage';
    component.yearBuilt = 2200;
    component.selectedManufacturerId = 2;
    component.saveChanges();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte ein gültiges Baujahr eingeben.');
  });

  it('should create filter plant and navigate to edit', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    const navigateCalls: Array<[unknown[], unknown?]> = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push([args[0] as unknown[], args[1]]);
      return Promise.resolve(true);
    }) as Router['navigate'];

    const component = fixture.componentInstance as FilterPlantEditPage & {
      description: string;
      yearBuilt: number | null;
      selectedManufacturerId: number | null;
      saveChanges: () => void;
    };
    component.description = 'Neue Anlage';
    component.yearBuilt = 2022;
    component.selectedManufacturerId = 2;
    component.saveChanges();

    const createRequest = httpMock.expectOne(
      'http://localhost:8000/customers/5/filter-plants'
    );
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({
      description: 'Neue Anlage',
      year_built: 2022,
      manufacturer_id: 2,
    });
    createRequest.flush({
      id: 9,
      customer_id: 5,
      manufacturer_id: 2,
      description: 'Neue Anlage',
      year_built: 2022,
    });

    expect(navigateCalls[0]).toEqual([
      ['/customers', 5, 'filter-plants', 9, 'edit'],
      { state: { createdPlant: 'Neue Anlage' } },
    ]);
  });

  it('should hide delete section in create mode', () => {
    const fixture = TestBed.createComponent(FilterPlantEditPage);
    fixture.detectChanges();

    const manufacturersRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    manufacturersRequest.flush([{ id: 2, name: 'FilterTech' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.danger-zone')).toBeFalsy();
    expect(compiled.textContent).toContain('Filteranlage anlegen');
  });
});
