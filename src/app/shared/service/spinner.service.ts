import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  cargando = new Subject<boolean>();
  constructor() { }

  mostrar() {
    this.cargando.next(true);
  }

  ocultar() {
    this.cargando.next(false);
  }
}
