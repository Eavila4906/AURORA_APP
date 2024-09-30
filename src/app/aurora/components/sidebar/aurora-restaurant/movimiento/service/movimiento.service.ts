import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  constructor(private http: HttpClient, private AuthService: AuthService) { }

  public crearMovimiento(data: any) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/crear-movimientos`, data );
  }

  public mostrarMovimiento(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-movimientos`, {  params });
  }

  public mostrarDetallesMovimiento(id_movimiento: string) {
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-detalles-movimientos/${id_movimiento}` );
  }

  public actualizarMovimiento(id_movimiento: string, data: any) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/actualizar-movimientos/${id_movimiento}`, data );
  }

  public eliminarMovimiento(id_movimiento: string) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/eliminar-movimientos/${id_movimiento}`,null );
  }
}
