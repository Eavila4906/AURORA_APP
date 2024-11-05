import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContableComponent } from './contable.component';

describe('ContableComponent', () => {
  let component: ContableComponent;
  let fixture: ComponentFixture<ContableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
