import { TestBed } from '@angular/core/testing';

import { CuentasPorPagarService } from './cuentas-por-pagar.service';

describe('CuentasPorPagarService', () => {
  let service: CuentasPorPagarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuentasPorPagarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
