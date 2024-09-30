import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SalsasService {

  constructor(private http: HttpClient, private AuthService: AuthService) { }

  
  mostrar() {
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/salsas-mostrar`);
  }
}
