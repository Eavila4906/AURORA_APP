import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CuentasPorPagarService {

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  getAll() {
    const url = this.AuthService.AuroraApiContable + '/cuentasPorPagar';
    return this.http.get<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  byRange(data: any) {
    const url = this.AuthService.AuroraApiContable + `/cuentasPorPagar/range/${data.fechaInicio}/${data.fechaFin}`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
