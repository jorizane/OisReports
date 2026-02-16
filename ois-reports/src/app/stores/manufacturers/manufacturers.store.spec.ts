import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ManufacturersStore } from './manufacturers.store';

describe('ManufacturersStore', () => {
  let store: ManufacturersStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManufacturersStore, provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(ManufacturersStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads manufacturers successfully', () => {
    store.loadManufacturers();
    expect(store.isLoading()).toBe(true);

    const request = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'FilterTech' }]);

    expect(store.isLoading()).toBe(false);
    expect(store.errorMessage()).toBe('');
    expect(store.manufacturers()).toEqual([{ id: 1, name: 'FilterTech' }]);
  });

  it('handles load error', () => {
    store.loadManufacturers();

    const request = httpMock.expectOne('http://localhost:8000/manufacturers');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    expect(store.isLoading()).toBe(false);
    expect(store.errorMessage()).toBe('Hersteller konnten nicht geladen werden.');
  });

  it('adds a manufacturer', () => {
    let successCalled = false;
    store.addManufacturer(' Aqua Systems ', () => {
      successCalled = true;
    });

    const request = httpMock.expectOne('http://localhost:8000/manufacturers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Aqua Systems' });
    request.flush({ id: 2, name: 'Aqua Systems' });

    expect(successCalled).toBe(true);
    expect(store.errorMessage()).toBe('');
    expect(store.manufacturers()).toEqual([{ id: 2, name: 'Aqua Systems' }]);
  });

  it('rejects empty manufacturer names without API call', () => {
    store.addManufacturer('   ');

    httpMock.expectNone('http://localhost:8000/manufacturers');
    expect(store.errorMessage()).toBe('Bitte einen Herstellernamen eingeben.');
  });
});
