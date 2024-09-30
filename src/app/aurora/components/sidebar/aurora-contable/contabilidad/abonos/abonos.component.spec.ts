import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonosComponent } from './abonos.component';

describe('AbonosComponent', () => {
  let component: AbonosComponent;
  let fixture: ComponentFixture<AbonosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbonosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbonosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
