import { TestBed } from '@angular/core/testing';

import { PuntosDeEmisionService } from './puntos-de-emision.service';

describe('PuntosDeEmisionService', () => {
  let service: PuntosDeEmisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuntosDeEmisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
