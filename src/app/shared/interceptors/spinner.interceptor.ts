import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize, throwError, of } from 'rxjs';
import { catchError, delay, retryWhen, mergeMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AppService } from 'src/app/services/app.service';
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
    const rol = localStorage.getItem('rolId') || '';
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        codigoEmpresa: codigoEmpresa,
        rol: rol
      }
    });

    this.spinner.mostrar();

    return next.handle(authReq).pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((error: HttpErrorResponse) => {
          if (error.status === 429) {
            if (!this.hasShown429Error) { 
              this.hasShown429Error = true;
              const errorMessage = 'Se ha realizado demasiadas solicitudes. Por favor, espera un momento e inténtalo nuevamente.';
              this.toastr.warning(errorMessage, '¡Atención!', { closeButton: true });
            }
            return of(error).pipe(delay(60000)); // Esperar 60 segundos antes de reintentar
          }
          // Si el error no es 429, simplemente lo pasamos al siguiente operador
          return throwError(() => error);
        })
      )),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.status !== 429) {
          errorMessage = error.error.message || `Error: ${error.status}\nMensaje: ${error.message}`;
          this.toastr.warning(errorMessage, '¡Atención!', { closeButton: true });
        }

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        if (!this.hasShown429Error) {
          this.spinner.ocultar();
        } else {
          setTimeout(() => {
            this.spinner.ocultar();
            this.hasShown429Error = false;
            window.location.reload();
          }, 60000);
        }
      })
    );

  }
}