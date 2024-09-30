import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  getAll() {
    const url = this.AuthService.AuroraApiCore + '/users';
    return this.http.get<any>(url);
  }

  get(id: number) {
    const url = this.AuthService.AuroraApiCore + '/user/'+id;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiCore + '/user/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiCore + `/user/update/${data.id}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  delete(id: number) {
    const url = this.AuthService.AuroraApiCore + `/user/delete/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  /**
   * User roles
   */
  getUserRole(id: number) {
    const url = this.AuthService.AuroraApiCore + `/user_roles/role/${id}`;
    return this.http.get<any>(url);
  }

  assignRoles(data: any) {
    const url = this.AuthService.AuroraApiCore + `/user_roles/assign`;
    const body = new FormData(data);
    return this.http.post<any>(url, body).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  /**
   * User companies
   */
  getUserCompanies(id: number) {
    const url = this.AuthService.AuroraApiCore + `/user_companies/company/${id}`;
    return this.http.get<any>(url);
  }

  assignCompanies(data: any) {
    const url = this.AuthService.AuroraApiCore + `/user_companies/assign`;
    const body = new FormData(data);
    return this.http.post<any>(url, body).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
