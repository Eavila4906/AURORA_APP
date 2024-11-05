import { TestBed } from '@angular/core/testing';

import { ConfirmNavigationGuard } from './confirm-navigation.guard';

describe('ConfirmNavigationGuard', () => {
  let guard: ConfirmNavigationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ConfirmNavigationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
