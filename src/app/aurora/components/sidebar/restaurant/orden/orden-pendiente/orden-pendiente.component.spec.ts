import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenPendienteComponent } from './orden-pendiente.component';

describe('OrdenPendienteComponent', () => {
  let component: OrdenPendienteComponent;
  let fixture: ComponentFixture<OrdenPendienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdenPendienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenPendienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
