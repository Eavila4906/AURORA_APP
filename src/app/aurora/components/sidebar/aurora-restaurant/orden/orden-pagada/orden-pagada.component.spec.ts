import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenPagadaComponent } from './orden-pagada.component';

describe('OrdenPagadaComponent', () => {
  let component: OrdenPagadaComponent;
  let fixture: ComponentFixture<OrdenPagadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdenPagadaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenPagadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
