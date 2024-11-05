import { TestBed } from '@angular/core/testing';

import { OtherServicesService } from './other-services.service';

describe('OtherServicesService', () => {
  let service: OtherServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
