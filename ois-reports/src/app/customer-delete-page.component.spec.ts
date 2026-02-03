import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { CustomerDeletePage } from './customer-delete-page.component';

describe('CustomerDeletePage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDeletePage],
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
    const fixture = TestBed.createComponent(CustomerDeletePage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers');
    expect(request.request.method).toBe('GET');
    request.flush([
      { id: 3, name: 'Redwood Filters' },
      { id: 7, name: 'Nova Filters' },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nova Filters');
    expect(compiled.textContent).not.toContain('Redwood Filters');
  });

  it('should delete selected customer after confirmation', () => {
    const fixture = TestBed.createComponent(CustomerDeletePage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([
      { id: 7, name: 'Nova Filters' },
      { id: 9, name: 'Orion Filters' },
    ]);

    const component = fixture.componentInstance as CustomerDeletePage & {
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
    const fixture = TestBed.createComponent(CustomerDeletePage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([
      { id: 7, name: 'Nova Filters' },
      { id: 9, name: 'Orion Filters' },
    ]);

    const component = fixture.componentInstance as CustomerDeletePage & {
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
    const fixture = TestBed.createComponent(CustomerDeletePage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/customers');
    request.flush([
      { id: 7, name: 'Nova Filters' },
      { id: 9, name: 'Orion Filters' },
    ]);

    const component = fixture.componentInstance as CustomerDeletePage & {
      editName: string;
      saveChanges: () => void;
    };

    component.editName = 'Nova Filters GmbH';
    component.saveChanges();

    const updateRequest = httpMock.expectOne('http://localhost:8000/customers/7');
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual({ name: 'Nova Filters GmbH' });
    updateRequest.flush({ id: 7, name: 'Nova Filters GmbH' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kunde "Nova Filters GmbH" wurde aktualisiert.');
  });
});
