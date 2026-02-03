import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ComponentDetailPage } from './component-detail-page.component';

describe('ComponentDetailPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '4', plantId: '11', componentId: '3' }),
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

  it('should load component details', () => {
    const fixture = TestBed.createComponent(ComponentDetailPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe X' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pumpe X');
  });
});
