import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ForbiddenComponent } from './forbidden.component';

describe('ForbiddenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForbiddenComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the not-authorized landing', () => {
    const fixture = TestBed.createComponent(ForbiddenComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(fixture.componentInstance).toBeTruthy();
    expect(text).toContain('Not authorized');
    expect(text).toContain('403');
  });
});
