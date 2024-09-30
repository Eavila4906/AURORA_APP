import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(private http: HttpClient, private AuthService: AuthService) {}

  mostrar() {
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/categoria-mostrar`);
  }

  registrar(nombre: string) {
    var formData = new FormData();
    formData.append("nombre", nombre);
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/categoria-registrar`, formData);
  }

  actualizar(id: string, data: any) {
    return this.http.put<any>(`${this.AuthService.AuroraApiRestaurant}/categoria-actualizar/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${this.AuthService.AuroraApiRestaurant}/categoria-eliminar/${id}`);
  }
}
