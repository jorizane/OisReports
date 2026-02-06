import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CustomersPage } from './customers-page.component';

describe('CustomersPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load customers on init', () => {
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    expect(clientsRequest.request.method).toBe('GET');
    clientsRequest.flush([{ id: 10, name: 'Auftraggeber A' }]);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'Acme Industries', client_id: 10 }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.list__row');
    expect(rows.length).toBe(1);
    expect(compiled.textContent).toContain('Acme Industries');
    expect(compiled.textContent).toContain('Auftraggeber A');
  });

  it('should add a customer', () => {
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 12, name: 'Auftraggeber B' }]);

    const initialRequest = httpMock.expectOne('http://localhost:8000/customers');
    initialRequest.flush([]);

    const component = fixture.componentInstance as CustomersPage & {
      newCustomerName: string;
      selectedClientId: number | null;
    };
    component.newCustomerName = 'Nova Filters';
    component.selectedClientId = 12;
    component.addCustomer();

    const createRequest = httpMock.expectOne('http://localhost:8000/customers');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Nova Filters', client_id: 12 });
    createRequest.flush({ id: 2, name: 'Nova Filters', client_id: 12 });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.list__row');
    expect(rows.length).toBe(1);
    expect(compiled.textContent).toContain('Nova Filters');
  });

  it('should dismiss success popup', () => {
    window.history.replaceState({ deletedCustomer: 'Nova Filters' }, '');

    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([]);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kunde "Nova Filters" wurde gelöscht.');

    const okButton = compiled.querySelector('.modal .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('Kunde "Nova Filters" wurde gelöscht.');
  });
});
