import { TestBed } from '@angular/core/testing';

import { TurnosConfigService } from './turnos-config.service';

describe('TurnosConfigService', () => {
  let service: TurnosConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnosConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
