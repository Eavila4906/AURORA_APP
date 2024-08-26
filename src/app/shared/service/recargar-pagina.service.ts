import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecargarPaginaService {

  constructor() { }


  public confirmarEnPáginaSalir(): void {
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      event.returnValue = '¿Estás seguro de que deseas salir de esta página?';
    });
  }
}
