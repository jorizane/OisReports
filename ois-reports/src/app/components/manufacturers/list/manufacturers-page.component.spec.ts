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

  it('should add a manufacturer', () => {
    const fixture = TestBed.createComponent(ManufacturersPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/manufacturers');
    request.flush([]);

    const component = fixture.componentInstance as ManufacturersPage & {
      newManufacturerName: string;
      addManufacturer: () => void;
    };

    component.newManufacturerName = 'Aqua Systems';
    component.addManufacturer();

    const createRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Aqua Systems' });
    createRequest.flush({ id: 2, name: 'Aqua Systems' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aqua Systems');
  });
});
