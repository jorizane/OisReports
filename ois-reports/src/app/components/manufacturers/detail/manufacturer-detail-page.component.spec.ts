import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ManufacturerDetailPage } from './manufacturer-detail-page.component';

describe('ManufacturerDetailPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '3' }),
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

  it('should load manufacturer and filter plants', () => {
    const fixture = TestBed.createComponent(ManufacturerDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/manufacturers/3');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 3, name: 'FilterTech' });

    const plantsRequest = httpMock.expectOne(
      'http://localhost:8000/manufacturers/3/filter-plants'
    );
    expect(plantsRequest.request.method).toBe('GET');
    plantsRequest.flush([
      {
        id: 9,
        customer_id: 5,
        manufacturer_id: 3,
        description: 'Filteranlage A',
        year_built: 2022,
      },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('FilterTech');
    expect(compiled.textContent).toContain('Filteranlage A');
  });
});
