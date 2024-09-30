import { TestBed } from '@angular/core/testing';

import { SalsasService } from './salsas.service';

describe('SalsasService', () => {
  let service: SalsasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalsasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
