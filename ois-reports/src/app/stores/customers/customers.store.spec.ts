import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CustomersStore } from './customers.store';

describe('CustomersStore', () => {
  let store: CustomersStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomersStore, provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(CustomersStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads clients successfully', () => {
    store.loadClients();

    const request = httpMock.expectOne('http://localhost:8000/clients');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 10, name: 'Auftraggeber A' }]);

    expect(store.clients()).toEqual([{ id: 10, name: 'Auftraggeber A' }]);
  });

  it('loads customers successfully', () => {
    store.loadCustomers();
    expect(store.isLoading()).toBe(true);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'Acme', client_id: 10 }]);

    expect(store.isLoading()).toBe(false);
    expect(store.errorMessage()).toBe('');
    expect(store.customers()).toEqual([{ id: 1, name: 'Acme', client_id: 10 }]);
  });

  it('adds a customer', () => {
    let createdCustomerName = '';

    store.addCustomer(' Nova Filters ', 12, (customer) => {
      createdCustomerName = customer.name;
    });

    const request = httpMock.expectOne('http://localhost:8000/customers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Nova Filters', client_id: 12 });
    request.flush({ id: 2, name: 'Nova Filters', client_id: 12 });

    expect(createdCustomerName).toBe('Nova Filters');
    expect(store.errorMessage()).toBe('');
    expect(store.customers()).toEqual([{ id: 2, name: 'Nova Filters', client_id: 12 }]);
  });

  it('validates empty customer name', () => {
    store.addCustomer('  ', 10);

    httpMock.expectNone('http://localhost:8000/customers');
    expect(store.errorMessage()).toBe('Bitte einen Kundennamen eingeben.');
  });

  it('validates missing client', () => {
    store.addCustomer('Acme', null);

    httpMock.expectNone('http://localhost:8000/customers');
    expect(store.errorMessage()).toBe('Bitte einen Auftraggeber auswählen.');
  });
});
