import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AbonoService {

  constructor(private http: HttpClient, private AuthService: AuthService) { }

  public mostrarAbonos(id_factura: string){
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.AuthService.getToken()}`
    });
    const params = new HttpParams()
      .set('id_factura', id_factura)
    return this.http.get<any>(`api/mostrar-abonos`,{ headers,params});
  }

  public cambiarTipoPago(id_abono: string,data: any){
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.AuthService.getToken()}`
    });
    return this.http.post<any>(`api/cambiar-tipo-pago/${id_abono}`,data,{ headers });
  }
}
