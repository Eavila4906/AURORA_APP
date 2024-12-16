import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from './services/app.service';

@Injectable({
  providedIn: 'root'
})
export class ValidarRolesGuard implements CanActivate {
  constructor(private appService: AppService, private router: Router) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const validarRol = this.appService.validarUsuario().role;

    if (!validarRol.includes("Mesero")) {
      return true;
    }

    // Si el usuario no tiene el rol necesario, redirige a la página de inicio de sesión
    this.router.navigate(['/login'])
    return false;
  }

}
