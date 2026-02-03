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
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    expect(componentsRequest.request.method).toBe('GET');
    componentsRequest.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage A');
    expect(compiled.textContent).toContain('2022');
  });

  it('should create a component', () => {
    const fixture = TestBed.createComponent(FilterPlantDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/filter-plants/11');
    request.flush({
      id: 11,
      customer_id: 5,
      description: 'Filteranlage A',
      year_built: 2022,
    });

    const componentsRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    componentsRequest.flush([]);

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
});
