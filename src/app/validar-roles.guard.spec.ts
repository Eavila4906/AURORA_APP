import { TestBed } from '@angular/core/testing';

import { ValidarRolesGuard } from './validar-roles.guard';

describe('ValidarRolesGuard', () => {
  let guard: ValidarRolesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ValidarRolesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
