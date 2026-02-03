import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

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
      description: 'Filteranlage X',
      year_built: 2015,
    });

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
      description: 'Filteranlage X',
      year_built: 2015,
    });

    const component = fixture.componentInstance as FilterPlantEditPage & {
      description: string;
      yearBuilt: number | null;
      saveChanges: () => void;
    };

    component.description = 'Filteranlage X2';
    component.yearBuilt = 2018;
    component.saveChanges();

    const updateRequest = httpMock.expectOne('http://localhost:8000/filter-plants/12');
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({
      id: 12,
      customer_id: 4,
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
      description: 'Filteranlage X',
      year_built: 2015,
    });

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
});
