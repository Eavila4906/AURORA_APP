import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulacionComponent } from './modulacion.component';

describe('ModulacionComponent', () => {
  let component: ModulacionComponent;
  let fixture: ComponentFixture<ModulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModulacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
