import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ManufacturersPage } from './manufacturers-page.component';

describe('ManufacturersPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturersPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load manufacturers', () => {
    const fixture = TestBed.createComponent(ManufacturersPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'FilterTech' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('FilterTech');
  });

  it('should render create button in header', () => {
    const fixture = TestBed.createComponent(ManufacturersPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/manufacturers');
    request.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const createLink = compiled.querySelector('a.link-button') as HTMLAnchorElement;
    expect(createLink).toBeTruthy();
    expect(createLink.textContent).toContain('Hersteller anlegen');
  });
});
