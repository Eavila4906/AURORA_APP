import { TestBed } from '@angular/core/testing';

import { LineasService } from './lineas.service';

describe('LineasService', () => {
  let service: LineasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
