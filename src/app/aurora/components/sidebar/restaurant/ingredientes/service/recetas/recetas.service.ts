import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecetasService {

  constructor(private http: HttpClient, private AuthService: AuthService) {
  }

  public crearReceta(data: any) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/crear-receta`, data );
  }

  public mostrarReceta(id_producto: string) {
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-receta/${id_producto}` );
  }

  public actualizarReceta(id_producto: string, data: any) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/actualizar-receta/${id_producto}`, data );
  }

}
