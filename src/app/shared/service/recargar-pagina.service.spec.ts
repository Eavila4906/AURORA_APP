import { TestBed } from '@angular/core/testing';

import { RecargarPaginaService } from './recargar-pagina.service';

describe('RecargarPaginaService', () => {
  let service: RecargarPaginaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecargarPaginaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
