import { TestBed } from '@angular/core/testing';

import { ContableService } from './contable.service';

describe('ContableService', () => {
  let service: ContableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
