import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('OIS Berichte');
    expect(compiled.textContent).toContain('Kundenübersicht');
    expect(compiled.textContent).toContain('Auftraggeberübersicht');
    expect(compiled.textContent).toContain('Herstellerübersicht');
    expect(compiled.textContent).toContain('Berichtsübersicht');
  });

  it('should link logo to customer overview', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const logoLink = compiled.querySelector('.shell__brand') as HTMLAnchorElement | null;
    expect(logoLink).toBeTruthy();
  });

});
