import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { CustomerEditPage } from './customer-edit-page.component';

describe('CustomerEditPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerEditPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '7' }),
            },
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load selected customer by route id', () => {
    const fixture = TestBed.createComponent(CustomerEditPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    expect(clientsRequest.request.method).toBe('GET');
    clientsRequest.flush([{ id: 4, name: 'Auftraggeber A' }]);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    expect(request.request.method).toBe('GET');
    request.flush([
      { id: 3, name: 'Redwood Filters', client_id: 4 },
      { id: 7, name: 'Nova Filters', client_id: 4 },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nova Filters');
    expect(compiled.textContent).not.toContain('Redwood Filters');
  });

  it('should delete selected customer after confirmation', () => {
    const fixture = TestBed.createComponent(CustomerEditPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 4, name: 'Auftraggeber A' }]);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([
      { id: 7, name: 'Nova Filters', client_id: 4 },
      { id: 9, name: 'Orion Filters', client_id: 4 },
    ]);

    const component = fixture.componentInstance as CustomerEditPage & {
      promptDelete: () => void;
      confirmDelete: () => void;
    };

    component.promptDelete();
    component.confirmDelete();

    const deleteRequest = httpMock.expectOne('http://localhost:8000/customers/7');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kunde "Nova Filters" wurde gelöscht.');
  });

  it('should dismiss success popup', () => {
    const fixture = TestBed.createComponent(CustomerEditPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 4, name: 'Auftraggeber A' }]);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([
      { id: 7, name: 'Nova Filters', client_id: 4 },
      { id: 9, name: 'Orion Filters', client_id: 4 },
    ]);

    const component = fixture.componentInstance as CustomerEditPage & {
      promptDelete: () => void;
      confirmDelete: () => void;
    };

    component.promptDelete();
    component.confirmDelete();

    const deleteRequest = httpMock.expectOne('http://localhost:8000/customers/7');
    deleteRequest.flush(null);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kunde "Nova Filters" wurde gelöscht.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('Kunde "Nova Filters" wurde gelöscht.');
  });

  it('should update selected customer name', () => {
    const fixture = TestBed.createComponent(CustomerEditPage);
    fixture.detectChanges();

    const clientsRequest = httpMock.expectOne('http://localhost:8000/clients');
    clientsRequest.flush([{ id: 4, name: 'Auftraggeber A' }]);

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([
      { id: 7, name: 'Nova Filters', client_id: 4 },
      { id: 9, name: 'Orion Filters', client_id: 4 },
    ]);

    const component = fixture.componentInstance as CustomerEditPage & {
      editName: string;
      selectedClientId: number | null;
      saveChanges: () => void;
    };

    component.editName = 'Nova Filters GmbH';
    component.selectedClientId = 4;
    component.saveChanges();

    const updateRequest = httpMock.expectOne('http://localhost:8000/customers/7');
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual({ name: 'Nova Filters GmbH', client_id: 4 });
    updateRequest.flush({ id: 7, name: 'Nova Filters GmbH', client_id: 4 });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kunde "Nova Filters GmbH" wurde aktualisiert.');
  });
});
