import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContableService {

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  reporteContable(data: any) {
    const url = this.AuthService.AuroraApiContable + '/reporteContable';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
