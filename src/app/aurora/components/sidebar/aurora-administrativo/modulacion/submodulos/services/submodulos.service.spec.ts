import { TestBed } from '@angular/core/testing';

import { SubmodulosService } from './submodulos.service';

describe('SubmodulosService', () => {
  let service: SubmodulosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmodulosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
