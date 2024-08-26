import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AppService } from 'src/app/service/app.service';
import { SpinnerService } from '../service/spinner.service';
 
@Injectable()
export class SnpinnerInterceptor implements HttpInterceptor {
  private hasShown429Error = false;

  constructor(
    private AppService: AppService, 
    private spinner: SpinnerService,
    private toastr: ToastrService
  ) { }  

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.AppService.token();
    const codigoEmpresa = localStorage.getItem('empresa') || '';
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        codigoEmpresa: codigoEmpresa
      }
    });

    this.spinner.mostrar();

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.status === 429) {
          if (!this.hasShown429Error) { 
            this.hasShown429Error = true;
            errorMessage = 'Se ha realizado demasiadas solicitudes. Por favor, espera un momento e inténtalo nuevamente.';
            this.toastr.warning(errorMessage, '¡Atención!', { closeButton: true });
          }
        } else {
          errorMessage = `Error: ${error.status}\nMensaje: ${error.message}`;
          this.toastr.warning(errorMessage, '¡Atención!', { closeButton: true });
        }

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.spinner.ocultar();
        if (this.hasShown429Error) {
          setTimeout(() => {
            this.hasShown429Error = false;
          }, 10000);
        }
      })
    );

  }
}