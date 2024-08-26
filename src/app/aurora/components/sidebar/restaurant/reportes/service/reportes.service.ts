import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(
    private http: HttpClient, 
    private AuthService: AuthService
  ) { }

    public reporteVentas(fechaDesde: string, fechaHasta: string) {
      const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-ventas`, { params });
    }

    public reporteVentasPedidosYa(fechaDesde: string, fechaHasta: string) {
      const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-ventas-pedidos-ya`, { params });
    }

    public reporteVentasGananciasDetalles(fechaDesde: string, fechaHasta: string) {
      const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-ventas-ganancias-detalles`, { params });
    }

    public reporteVentasGananciasGlobal(fechaDesde: string, fechaHasta: string) {
      const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-ventas-ganancias-global`, { params });
    }
    
    public reporteGramaje(fechaDesde: string, fechaHasta: string) {
      const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-gramaje`, { params });
    }
    
    public mostrarfechaMayorAndMenor(){
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-fechas`)
    }
    
    public reporteIngredienteVentas(fechaDesde: string, fechaHasta: string) {
      const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-ventas-ingredientes`, { params });
    }

    public mostrarStockIngrediendes(){
      return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/reporte-stock-ingredientes`)
    }
}
