import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PuntosDeEmisionService {

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  getAll() {
    const url = this.AuthService.AuroraApiContable + '/puntos_emision_factura';
    return this.http.get<any>(url);
  }

  get(id: number) {
    const url = this.AuthService.AuroraApiContable + '/punto_emision_factura/'+id;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiContable + '/punto_emision_factura/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiContable + `/punto_emision_factura/edit/${data.data.id}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  delete(id: number) {
    const url = this.AuthService.AuroraApiContable + `/punto_emision_factura/delete/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
