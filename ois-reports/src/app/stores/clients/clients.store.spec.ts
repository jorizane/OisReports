import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClientsStore } from './clients.store';

describe('ClientsStore', () => {
  let store: ClientsStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientsStore, provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(ClientsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads clients successfully', () => {
    store.loadClients();
    expect(store.isLoading()).toBe(true);

    const request = httpMock.expectOne('http://localhost:8000/clients');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'Auftraggeber A' }]);

    expect(store.isLoading()).toBe(false);
    expect(store.errorMessage()).toBe('');
    expect(store.clients()).toEqual([{ id: 1, name: 'Auftraggeber A' }]);
  });

  it('handles load error', () => {
    store.loadClients();

    const request = httpMock.expectOne('http://localhost:8000/clients');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    expect(store.isLoading()).toBe(false);
    expect(store.clients()).toEqual([]);
    expect(store.errorMessage()).toBe('Auftraggeber konnten nicht geladen werden.');
  });

  it('adds a client and invokes success callback', () => {
    let successCalled = false;
    const onSuccess = () => {
      successCalled = true;
    };

    store.addClient(' Auftraggeber B ', onSuccess);

    const request = httpMock.expectOne('http://localhost:8000/clients');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Auftraggeber B' });
    request.flush({ id: 2, name: 'Auftraggeber B' });

    expect(store.clients()).toEqual([{ id: 2, name: 'Auftraggeber B' }]);
    expect(store.errorMessage()).toBe('');
    expect(successCalled).toBe(true);
  });

  it('rejects empty client names without API call', () => {
    store.addClient('   ');

    httpMock.expectNone('http://localhost:8000/clients');
    expect(store.errorMessage()).toBe('Bitte einen Auftraggebernamen eingeben.');
  });
});
