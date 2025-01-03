import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtendidasComponent } from './atendidas.component';

describe('AtendidasComponent', () => {
  let component: AtendidasComponent;
  let fixture: ComponentFixture<AtendidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtendidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtendidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
