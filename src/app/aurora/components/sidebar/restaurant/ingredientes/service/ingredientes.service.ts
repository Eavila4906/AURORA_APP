import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class IngredientesService {

  constructor(private http: HttpClient, private AuthService: AuthService) {
  }
  
  mostrar() {
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/ingrediente-mostrar`);
  }

  registrar(nombre: string,medida: string) {
    var formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("medida", medida);
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/ingrediente-registrar`, formData);
  }

  actualizar(id: string, data: any) {
    return this.http.put<any>(`${this.AuthService.AuroraApiRestaurant}/ingrediente-actualizar/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${this.AuthService.AuroraApiRestaurant}/ingrediente-eliminar/${id}`);
  }
}
