import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TurnosConfigService {

  constructor(
    private AuthService: AuthService,
    private http: HttpClient
  ) { }

  getAll() {
    const url = this.AuthService.AuroraApiContable + '/turnosConfig';
    return this.http.get<any>(url);
  }

  get(id: number) {
    const url = this.AuthService.AuroraApiContable + '/turnoConfig/' + id;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiContable + '/turnoConfig/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiContable + `/turnoConfig/edit/${data.data.id}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  delete(id: number) {
    const url = this.AuthService.AuroraApiContable + `/turnoConfig/delete/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
