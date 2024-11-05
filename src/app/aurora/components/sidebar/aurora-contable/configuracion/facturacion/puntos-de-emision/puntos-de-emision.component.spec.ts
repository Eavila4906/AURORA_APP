import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntosDeEmisionComponent } from './puntos-de-emision.component';

describe('PuntosDeEmisionComponent', () => {
  let component: PuntosDeEmisionComponent;
  let fixture: ComponentFixture<PuntosDeEmisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuntosDeEmisionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuntosDeEmisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
