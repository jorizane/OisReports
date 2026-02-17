import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';

import { ComponentEditPage } from './component-edit-page.component';

describe('ComponentEditPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentEditPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '4', plantId: '11', componentId: '3' }),
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

  it('should load component for editing', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe X' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pumpe X');
  });

  it('should update component', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    request.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe X' });

    const component = fixture.componentInstance as ComponentEditPage & {
      name: string;
      saveChanges: () => void;
    };

    component.name = 'Pumpe XL';
    component.saveChanges();

    const updateRequest = httpMock.expectOne('http://localhost:8000/components/3');
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe XL' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pumpe XL');
  });

  it('should show error when component not found', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    request.flush({}, { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Komponente nicht gefunden.');
  });

  it('should delete component after confirmation', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    request.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe X' });

    const component = fixture.componentInstance as ComponentEditPage & {
      promptDelete: () => void;
      confirmDelete: () => void;
    };

    component.promptDelete();
    component.confirmDelete();

    const deleteRequest = httpMock.expectOne('http://localhost:8000/components/3');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });

  it('should cancel delete when overlay is clicked', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    request.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe X' });

    const component = fixture.componentInstance as ComponentEditPage & {
      promptDelete: () => void;
    };
    component.promptDelete();

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal')).toBeTruthy();

    const overlay = compiled.querySelector('.modal__overlay') as HTMLDivElement;
    overlay.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal')).toBeFalsy();
  });

  it('should dismiss success modal', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const request = httpMock.expectOne('http://localhost:8000/components/3');
    request.flush({ id: 3, filter_plant_id: 11, name: 'Pumpe X' });

    const component = fixture.componentInstance as ComponentEditPage & {
      promptDelete: () => void;
      confirmDelete: () => void;
    };
    component.promptDelete();
    component.confirmDelete();

    const deleteRequest = httpMock.expectOne('http://localhost:8000/components/3');
    deleteRequest.flush(null);

    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Komponente wurde gelöscht.');

    const okButton = compiled.querySelector('.modal--success .ghost-button') as HTMLButtonElement;
    okButton.click();

    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Komponente wurde gelöscht.');
  });
});

describe('ComponentEditPage (create mode)', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentEditPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '4', plantId: '11' }),
            },
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component and navigate to edit', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const navigateCalls: Array<[unknown[], unknown?]> = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push([args[0] as unknown[], args[1]]);
      return Promise.resolve(true);
    }) as Router['navigate'];

    const component = fixture.componentInstance as ComponentEditPage & {
      name: string;
      saveChanges: () => void;
    };
    component.name = 'Ventil A';
    component.saveChanges();

    const createRequest = httpMock.expectOne(
      'http://localhost:8000/filter-plants/11/components'
    );
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({ name: 'Ventil A' });
    createRequest.flush({ id: 7, filter_plant_id: 11, name: 'Ventil A' });

    expect(navigateCalls[0]).toEqual([
      ['/customers', 4, 'filter-plants', 11, 'components', 7, 'edit'],
      { state: { createdComponent: 'Ventil A' } },
    ]);
  });

  it('should show validation error when name is missing', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const component = fixture.componentInstance as ComponentEditPage & {
      saveChanges: () => void;
    };
    component.saveChanges();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bitte einen Namen eingeben.');
  });

  it('should hide delete section in create mode', () => {
    const fixture = TestBed.createComponent(ComponentEditPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.danger-zone')).toBeFalsy();
    expect(compiled.textContent).toContain('Komponente anlegen');
  });
});
