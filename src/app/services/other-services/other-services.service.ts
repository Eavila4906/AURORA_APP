import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OtherServicesService {

  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }
  
  /**
   * Obtener tipos de identificación
   */
  getTiposIdentificacion() {
    const url = this.AuthService.AuroraApiContable + '/tipos_de_identificacion';
    return this.http.get<any>(url);
  }

  /**
   * Obtener tipos de IVA
   */
  getTiposIva() {
    const url = this.AuthService.AuroraApiContable + '/tipos_de_iva';
    return this.http.get<any>(url);
  }

  /**
   * Obtener tipos de movimientos
   */
  getTiposMovimientos() {
    const url = this.AuthService.AuroraApiContable + '/movimientos';
    return this.http.get<any>(url);
  }

  /**
   * Obtener tipos de medición
   */
  getTiposMedicion() {
    const url = this.AuthService.AuroraApiContable + '/tipos_de_medicion';
    return this.http.get<any>(url);
  }

}
