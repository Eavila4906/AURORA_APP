import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {

  constructor(
    private AuthService: AuthService,
    private http: HttpClient
  ) { }

  getAll() {
    const url = this.AuthService.AuroraApiContable + '/ordenes';
    return this.http.get<any>(url);
  }

  get(id: number) {
    const url = this.AuthService.AuroraApiContable + '/orden/' + id;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiContable + '/orden/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiContable + `/orden/edit/${data.data.id}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  /**
   * More functions
   */
  getPendientes() {
    const url = this.AuthService.AuroraApiContable + '/ordenes/pendientes';
    return this.http.get<any>(url);
  }

  getAtendidas() {
    const url = this.AuthService.AuroraApiContable + '/ordenes/atendidas';
    return this.http.get<any>(url);
  }

  annular(id: number) {
    const url = this.AuthService.AuroraApiContable + `/orden/anular/${id}`;
    return this.http.put<any>(url, null).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  attend(id: number) {
    const url = this.AuthService.AuroraApiContable + `/orden/atender/${id}`;
    return this.http.put<any>(url, null).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
