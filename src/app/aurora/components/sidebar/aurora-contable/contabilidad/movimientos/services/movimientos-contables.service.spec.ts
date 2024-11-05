import { TestBed } from '@angular/core/testing';

import { MovimientosContablesService } from './movimientos-contables.service';

describe('MovimientosContablesService', () => {
  let service: MovimientosContablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovimientosContablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
