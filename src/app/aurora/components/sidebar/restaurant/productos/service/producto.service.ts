import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpClient, private AuthService: AuthService) { }

  mostrar() {
    return this.http.get<any>(`${this.AuthService.urlApi}/producto-mostrar`);
  }

  registrar(
    nombre: string, categoria: string,
    estatus: string,precio_compra: string,
    precio_venta: string,
    precio_venta2: string,margen: string,
    adicionales: string,
    descripcion: string,imagen: File) {

    var formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("categoria", categoria);
    formData.append("estatus", estatus);
    formData.append("precio_compra", precio_compra);
    formData.append("precio_venta", precio_venta);
    formData.append("precio_venta2", precio_venta2);
    formData.append("margen", margen);
    formData.append("adicionales", adicionales);
    formData.append("descripcion", descripcion);
    formData.append("imagen", imagen,imagen.name);

    return this.http.post<any>(`${this.AuthService.urlApi}/producto-registrar`, formData);
  }

  actualizar(id: string,nombre: string, categoria: string,
    estatus: string,precio_compra: string,
    precio_venta: string, precio_venta2: string,
    margen: string,adicionales: string,
    descripcion: string,imagen: File) {
    var formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("categoria", categoria);
    formData.append("estatus", estatus);
    formData.append("precio_compra", precio_compra);
    formData.append("precio_venta", precio_venta);
    formData.append("precio_venta2", precio_venta2);
    formData.append("margen", margen);
    formData.append("adicionales", adicionales);
    formData.append("descripcion", descripcion);
    formData.append("imagen", imagen);
    return this.http.post<any>(`api/producto-actualizar/${id}`, formData);
  }

  eliminar(id: number) {
   
    return this.http.delete<any>(`api/producto-eliminar/${id}`);
  }
}
