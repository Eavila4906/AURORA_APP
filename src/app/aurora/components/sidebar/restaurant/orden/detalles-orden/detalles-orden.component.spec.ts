import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesOrdenComponent } from './detalles-orden.component';

describe('DetallesOrdenComponent', () => {
  let component: DetallesOrdenComponent;
  let fixture: ComponentFixture<DetallesOrdenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetallesOrdenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesOrdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
