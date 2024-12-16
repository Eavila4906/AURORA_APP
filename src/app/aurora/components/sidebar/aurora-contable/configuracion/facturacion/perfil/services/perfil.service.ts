import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(
    private AuthService: AuthService, 
    private http: HttpClient
  ) { }

  get codigoEmpresa() {
    return localStorage.getItem('empresa');
  }

  get() {
    const url = this.AuthService.AuroraApiContable + '/perfil_de_factura/'+this.codigoEmpresa;
    return this.http.get<any>(url);
  }

  create(data: any) {
    const url = this.AuthService.AuroraApiContable + '/perfil_de_factura/create';
    return this.http.post<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  edit(data: any) {
    const url = this.AuthService.AuroraApiContable + `/perfil_de_factura/edit/${this.codigoEmpresa}`;
    return this.http.put<any>(url, data).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  delete(id: number) {
    const url = this.AuthService.AuroraApiContable + `/perfil_de_factura/delete/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  /**
   * MORE FUNCTIONS
   */

  subirLogo(data: any) {
    const url = this.AuthService.AuroraApiContable + `/perfil_de_factura/logo/${this.codigoEmpresa}`;
    const body =new FormData();
    body.append('logo', data as File);
    return this.http.post<any>(url, body).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

  registrarFirma(data: any) {
    const url = this.AuthService.AuroraApiContable + `/perfil_de_factura/firma/${this.codigoEmpresa}`;
    const body =new FormData();
    body.append('firmaElectronica', data.firmaElectronica);
    body.append('certificadoFirma', data.certificadoFirma as File);
    body.append('claveFirma', data.claveFirma);
    body.append('fechaVigencia', data.fechaVigencia);
    body.append('propietarioCertificado', data.propietarioCertificado);
    body.append('contribuyenteRimpe', data.contribuyenteRimpe);
    body.append('contribuyenteEspecial', data.contribuyenteEspecial);
    body.append('negocioPopular', data.negocioPopular);
    body.append('obligadoContabilidad', data.obligadoContabilidad);
    body.append('agenteRetencion', data.agenteRetencion);
    return this.http.post<any>(url, body).pipe(
      catchError(error => {
        return throwError(error.error.message);
      })
    );
  }

}
