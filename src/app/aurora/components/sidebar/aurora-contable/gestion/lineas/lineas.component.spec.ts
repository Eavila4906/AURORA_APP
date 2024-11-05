import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineasComponent } from './lineas.component';

describe('LineasComponent', () => {
  let component: LineasComponent;
  let fixture: ComponentFixture<LineasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
