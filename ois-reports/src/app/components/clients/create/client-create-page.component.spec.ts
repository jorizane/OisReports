import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ClientCreatePage } from './client-create-page.component';

describe('ClientCreatePage', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCreatePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show validation error when name is empty', () => {
    const fixture = TestBed.createComponent(ClientCreatePage);
    fixture.detectChanges();

    const component = fixture.componentInstance as ClientCreatePage & { saveClient: () => void };
    component.saveClient();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte einen Auftraggebernamen eingeben.');
  });

  it('should create a client and navigate back to list', () => {
    const fixture = TestBed.createComponent(ClientCreatePage);
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigate');
    const component = fixture.componentInstance as ClientCreatePage & { name: string };
    component.name = 'Auftraggeber A';
    component.saveClient();

    const createRequest = httpMock.expectOne('http://localhost:8000/clients');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Auftraggeber A' });
    createRequest.flush({ id: 3, name: 'Auftraggeber A' });

    expect(navigateSpy).toHaveBeenCalledWith(['/clients'], {
      state: { createdClient: 'Auftraggeber A' },
    });
  });
});
