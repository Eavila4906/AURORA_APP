import { TestBed } from '@angular/core/testing';

import { ComprarService } from './comprar.service';

describe('ComprarService', () => {
  let service: ComprarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComprarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
