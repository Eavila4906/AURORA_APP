import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {

  tipoPedido: String = '';
  tipoPedidoAux: String = '';

  listaOrdenProductos: any[] = [];
  listaOrdenProductosActu: any[] = [];
  listaOrdenProductosNuevos: any[] = [];
  constructor(private http: HttpClient, private AuthService: AuthService) { }

  public crearOrden(data: any) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/crear-orden`, data );
  }

  public numeroOrden() {
   
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/numero-orden` );
  }

  public mostrarOrdenPendientes(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-orden-pendientes`, {  params });
  }

  public mostrarOrdenPagadas(fechaDesde: string, fechaHasta: string) {
   
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-orden-pagadas`, {  params });
  }


  public mostrarDetalleOrden(id_factura: string) {
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-detalle-orden/${id_factura}` );
  }


  public mostrarDatosOrden(id_factura: string) {
   
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-datos-orden/${id_factura}` );
  }

  public actualizarOrden(id_factura: string, data: any) {
   
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/actualizar-orden/${id_factura}`, data );
  }

  public pagoFactura(id_factura: string, data: any) {
   
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/pago-factura/${id_factura}`, data );
  }

  public eliminarOrden(id_factura: number) {
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/eliminar-orden/${id_factura}`,null );
  }

  public pagoProductos(id_factura: string, data: any) {
   
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/pago-productos/${id_factura}`, data);
  }

  
  public eliminarOrdenPagada(id_factura: string, data: any) {
   
    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/eliminar-orden-pagada/${id_factura}`, data );
  }

  public registrarDelivery(factura: string, valor: string, comentarios: string) {
   
    var formData = new FormData();
    formData.append("factura", factura);
    formData.append("valor", valor);
    formData.append("comentarios", comentarios);

    return this.http.post<any>(`${this.AuthService.AuroraApiRestaurant}/registrar-delivery`, formData );
  }


  public mostrarDelivery(fechaDesde: string, fechaHasta: string) {
   
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-delivery`, {  params },);
  }

  public mostrarDeliveryId(idFactura: string) {
   
    const params = new HttpParams()
      .set('id_factura', idFactura)
    return this.http.get<any>(`${this.AuthService.AuroraApiRestaurant}/mostrar-deliveryId`, { params },);
  }

  public eliminarDelivery(id: number) {
   
    return this.http.delete<any>(`${this.AuthService.AuroraApiRestaurant}/eliminar-delivery/${id}` );
  }
}

