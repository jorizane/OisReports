import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

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
});
