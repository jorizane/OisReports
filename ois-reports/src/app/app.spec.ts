import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([]);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Customers');
  });

  it('should load customers on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, name: 'Acme Industries' }]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.list__row');
    expect(rows.length).toBe(1);
    expect(compiled.textContent).toContain('Acme Industries');
  });

  it('should add a customer', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const initialRequest = httpMock.expectOne('http://localhost:8000/customers');
    initialRequest.flush([]);

    const component = fixture.componentInstance as App & { newCustomerName: string };
    component.newCustomerName = 'Nova Filters';
    component.addCustomer();

    const createRequest = httpMock.expectOne('http://localhost:8000/customers');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Nova Filters' });
    createRequest.flush({ id: 2, name: 'Nova Filters' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.list__row');
    expect(rows.length).toBe(1);
    expect(compiled.textContent).toContain('Nova Filters');
  });
});
