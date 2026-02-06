import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClientsPage } from './clients-page.component';

describe('ClientsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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

  it('should add a client', () => {
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();

    const initialRequest = httpMock.expectOne('http://localhost:8000/clients');
    initialRequest.flush([]);

    const component = fixture.componentInstance as ClientsPage & { newClientName: string };
    component.newClientName = 'Auftraggeber B';
    component.addClient();

    const createRequest = httpMock.expectOne('http://localhost:8000/clients');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Auftraggeber B' });
    createRequest.flush({ id: 2, name: 'Auftraggeber B' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auftraggeber B');
  });
});
