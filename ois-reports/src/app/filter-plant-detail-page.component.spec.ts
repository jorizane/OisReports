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
              paramMap: convertToParamMap({ plantId: '11' }),
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

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Filteranlage A');
    expect(compiled.textContent).toContain('2022');
  });
});
