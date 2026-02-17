import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ManufacturerCreatePage } from './manufacturer-create-page.component';

describe('ManufacturerCreatePage', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerCreatePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show validation error when name is empty', () => {
    const fixture = TestBed.createComponent(ManufacturerCreatePage);
    fixture.detectChanges();

    const component = fixture.componentInstance as ManufacturerCreatePage & {
      saveManufacturer: () => void;
    };
    component.saveManufacturer();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte einen Herstellernamen eingeben.');
  });

  it('should show validation error when name is too long', () => {
    const fixture = TestBed.createComponent(ManufacturerCreatePage);
    fixture.detectChanges();

    const component = fixture.componentInstance as ManufacturerCreatePage & { name: string };
    component.name = 'A'.repeat(101);
    component.saveManufacturer();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Name darf maximal 100 Zeichen haben.');
  });

  it('should create a manufacturer and navigate back to list', () => {
    const fixture = TestBed.createComponent(ManufacturerCreatePage);
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigate');
    const component = fixture.componentInstance as ManufacturerCreatePage & { name: string };
    component.name = 'FilterTech';
    component.saveManufacturer();

    const createRequest = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'FilterTech' });
    createRequest.flush({ id: 5, name: 'FilterTech' });

    expect(navigateSpy).toHaveBeenCalledWith(['/manufacturers'], {
      state: { createdManufacturer: 'FilterTech' },
    });
  });
});
