import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {
  codigoEmpresa: any = localStorage.getItem('empresa');

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  get() {
    const url = this.AuthService.AuroraApiContable + '/config/sistema/'+this.codigoEmpresa;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiContable + '/config/sistema/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiContable + `/config/sistema/edit/${this.codigoEmpresa}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  delete() {
    const url = this.AuthService.AuroraApiContable + `/config/sistema/delete/${this.codigoEmpresa}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
