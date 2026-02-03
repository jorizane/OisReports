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
    request.flush({ id: 4, name: 'Aqua Filters' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aqua Filters');
    expect(compiled.textContent).toContain('#4');
  });
});
