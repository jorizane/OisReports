import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ClientsPage } from './clients-page.component';

describe('ClientsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load clients', () => {
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/clients');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'Auftraggeber A' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auftraggeber A');
  });

  it('should render create button in header', () => {
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/clients');
    request.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const createLink = compiled.querySelector('a.link-button') as HTMLAnchorElement;
    expect(createLink).toBeTruthy();
    expect(createLink.textContent).toContain('Auftraggeber anlegen');
  });

  it('should show error on load failure', () => {
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/clients');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auftraggeber konnten nicht geladen werden.');
  });

  it('should show created success from history state', () => {
    window.history.replaceState({ createdClient: 'Client X' }, '');

    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/clients');
    request.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auftraggeber "Client X" wurde angelegt.');
  });
});
