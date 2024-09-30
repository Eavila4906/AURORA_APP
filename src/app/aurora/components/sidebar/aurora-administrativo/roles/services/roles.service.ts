import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  getAll() {
    const url = this.AuthService.AuroraApiCore + '/roles';
    return this.http.get<any>(url);
  }

  get(id: number) {
    const url = this.AuthService.AuroraApiCore + '/role/'+id;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiCore + '/role/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiCore + `/role/update/${data.id}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  delete(id: number) {
    const url = this.AuthService.AuroraApiCore + `/role/delete/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }


  /**
   * Permisos para módulos, submódulos e items
   */
  getPermissions(id: number) {
    const url = this.AuthService.AuroraApiCore + `/permissions/role/${id}`;
    return this.http.get<any>(url);
  }

  assignPermissions(data: any) {
    const url = this.AuthService.AuroraApiCore + '/permissions/assign';
    //const body = new FormData(data);
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  getPermissionsSubmodulos(id: number) {
    const url = this.AuthService.AuroraApiCore + `/permissions_submodule/role/${id}`;
    return this.http.get<any>(url);
  }

  assignPermissionsSubmodulos(data: any) {
    const url = this.AuthService.AuroraApiCore + '/permissions_submodule/assign';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  getPermissionsItems(id: number) {
    const url = this.AuthService.AuroraApiCore + `/permissions_item/role/${id}`;
    return this.http.get<any>(url);
  }

  assignPermissionsItems(data: any) {
    const url = this.AuthService.AuroraApiCore + '/permissions_item/assign';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
