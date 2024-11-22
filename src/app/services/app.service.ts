import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  urlBaseApiCore: string = 'http://localhost:8000/api';
  urlBaseApiRestaurant: string = 'http://localhost:8080/aurora_restaurant_api/public/api';
  urlBaseApiContable: string = 'http://localhost:8001/api';

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) { }

  getAuroraApiCore() {
    return this.urlBaseApiCore;
  }

  getAuroraApiRestaurant() {
    return this.urlBaseApiRestaurant;
  }

  getAuroraApiContable() {
    return this.urlBaseApiContable;
  }

  token() {
    const userData = localStorage.getItem('userData');
    if (userData !== null) {
      let userdata = JSON.parse(userData);
      return userdata.access_token;
    }
  }

  httpHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token()}`
      })
    };
  }

  /*validarRoles() {
    let rol = localStorage.getItem('rol');
    if (rol !== null) {
      let data = JSON.parse(rol);
      console.log(data[0].rol)
      return data[0].rol;
    }
  }*/

  userData() {
    const url = this.getAuroraApiCore() + `/authenticated/user`;
    return this.http.get<any>(url)
  }

  validarRolesPorNombre(): any {
    var userDataString: any = [];
    const role = localStorage.getItem('rol');

    this.userData().subscribe(response => {
      userDataString = response.data;

      if (userDataString !== null) {
        const userData = userDataString;

        if (userData.roles && Array.isArray(userData.roles)) {
          let roleExists = userData.roles.some(function (roleObj: any) {
            return roleObj.rol == role;
          });

          if (roleExists) {
            return role;
          } else {
            const url = this.getAuroraApiCore() + '/logout';
            this.http.post(url, null, this.httpHeader()).pipe(
              catchError(error => {
                return throwError("Ha ocurrido un error, intentelo mas tarde.");
              })
            ).subscribe(response => {
              if (response) {
                this.toastr.warning('Se ha cerrado la sesión porque se detectó una acción mal intencionada.', '¡Atención!', { closeButton: true, timeOut: 12000 });
                this.toastr.error('Usted no cuenta con este rol asignado.', '¡Error!', { closeButton: true, timeOut: 12000 });
                localStorage.clear();
                this.router.navigate(['/login']);
              }
            });
          }

        } else {
          this.toastr.error('El usuario no tiene roles definidos.', '¡Error!', { closeButton: true });
        }
      } else {
        this.toastr.error('No existe una sesión activa.', '¡Error!', { closeButton: true });
      }

      return role;

    });

    return role;
  }

  validarRolesPorId(): any {
    var userDataString: any = [];
    const role = localStorage.getItem('rolId');

    this.userData().subscribe(response => {
      userDataString = response.data;

      if (userDataString !== null) {
        const userData = userDataString;

        if (userData.roles && Array.isArray(userData.roles)) {
          let roleExists = userData.roles.some(function (roleObj: any) {
            return roleObj.id == role;
          });

          if (roleExists) {
            return role;
          } else {
            const url = this.getAuroraApiCore() + '/logout';
            this.http.post(url, null, this.httpHeader()).pipe(
              catchError(error => {
                return throwError("Ha ocurrido un error, intentelo mas tarde.");
              })
            ).subscribe(response => {
              if (response) {
                this.toastr.warning('Se ha cerrado la sesión porque se detectó una acción mal intencionada.', '¡Atención!', { closeButton: true, timeOut: 12000 });
                this.toastr.error('Usted no cuenta con este rol asignado.', '¡Error!', { closeButton: true, timeOut: 12000 });
                localStorage.clear();
                this.router.navigate(['/login']);
              }
            });
          }

        } else {
          this.toastr.error('El usuario no tiene roles definidos.', '¡Error!', { closeButton: true });
        }
      } else {
        this.toastr.error('No existe una sesión activa.', '¡Error!', { closeButton: true });
      }

      return role;

    });

    return role;
  }

  validarEmpresa(): any {
    var userDataString: any = [];
    const empresa = localStorage.getItem('empresa');

    this.userData().subscribe(response => {
      userDataString = response.data;

      if (userDataString !== null) {
        const userData = userDataString;

        if (userData.companies && Array.isArray(userData.companies)) {
          let companyExists = userData.companies.some(function (companyObj: any) {
            return companyObj.id == empresa;
          });

          if (companyExists) {
            return empresa;
          } else {
            const url = this.getAuroraApiCore() + '/logout';
            this.http.post(url, null, this.httpHeader()).pipe(
              catchError(error => {
                return throwError("Ha ocurrido un error, intentelo mas tarde.");
              })
            ).subscribe(response => {
              if (response) {
                this.toastr.warning('Se ha cerrado la sesión porque se detectó una acción mal intencionada.', '¡Atención!', { closeButton: true, timeOut: 12000 });
                this.toastr.error('Usted no esta asignado a esta empresa.', '¡Error!', { closeButton: true, timeOut: 12000 });
                localStorage.clear();
                this.router.navigate(['/login']);
              }
            });
          }

        } else {
          this.toastr.error('El usuario no tiene empresas definidas.', '¡Error!', { closeButton: true });
        }
      } else {
        this.toastr.error('No existe una sesión activa.', '¡Error!', { closeButton: true });
      }

      return empresa;

    });

    return empresa;
  }

  getMenu() {
    const id = this.validarRolesPorId();
    this.validarEmpresa();
    const url = this.getAuroraApiCore() + `/menu`;
    const body = { 'role': localStorage.getItem('rolId') };
    return this.http.post<any>(url, body);
  }

  getPermissions(id: number, type: string) {
    const rId = this.validarRolesPorId();
    this.validarEmpresa();

    if (type === 'module') {
      const url = this.getAuroraApiCore() + `/permissions/module/${id}/role/${rId}`;
      return this.http.get<any>(url);
    } else if (type === 'submodule') {
      const url = this.getAuroraApiCore() + `/permissions_submodule/submodule/${id}/role/${rId}`;
      return this.http.get<any>(url);
    } else {
      const url = this.getAuroraApiCore() + `/permissions_item/item/${id}/role/${rId}`;
      return this.http.get<any>(url);
    }
  }

  getPermissionsModules() {
    const id = this.validarRolesPorId();
    this.validarEmpresa();
    const url = this.getAuroraApiCore + `/permissions/modules/${id}`;
    return this.http.get<any>(url);
  }

  getEntityModulation(currentPath: string): any {
    let currentModule: any[] = [];

    const menuString = localStorage.getItem('menu');
    if (menuString) {
      const modulesArray: any = Object.values(JSON.parse(menuString));

      modulesArray.forEach((module: any) => {
        if (module.submodules && !Array.isArray(module.submodules)) {
          module.submodules = Object.values(module.submodules);
        }

        module.submodules.forEach((submodule: any) => {
          if (submodule.items && !Array.isArray(submodule.items)) {
            submodule.items = Object.values(submodule.items);
          }
        });
      });

      for (const module of modulesArray) {

        if (module.module_path === currentPath) {
          currentModule = [{ id: module.module_id, type: 'module' }];
        }

        const segments = currentPath.split('/').filter(segment => segment);

        if (module.submodules.length) {
          let submodulePath = '/' + segments[1];

          for (const submodule of module.submodules) {
            if (submodule.submodule_path == submodulePath) {
              currentModule = [{ id: submodule.submodule_id, type: 'submodule' }];
            }

            if (submodule.items.length) {
              let itemPath = '/' + segments[2];
              for (const item of submodule.items) {
                if (item.item_path == itemPath) {
                  currentModule = [{ id: item.item_id, type: 'item' }];
                }
              }
            }
          }
        }
      }
      return currentModule;
    }
  }

  getDataAuditoria(op: string) {
    const userData = localStorage.getItem('userData');
    const codigoEmpresa = localStorage.getItem('empresa');

    if (userData !== null) {
      let userdata = JSON.parse(userData);
      if (op === 'create') {
        return {
          usrCreador: userdata.user?.username,
          codigoEmpresa: codigoEmpresa 
        };
      } else {
        return {
          usrEditor: userdata.user?.username
        };
      }
    }

    return null;  
  }

  padNumber(num: number, length: number = 7): string {
    return num.toString().padStart(length, '0');
  }

  getTimeZoneCurrentDate() {
    // Obtener la fecha y hora en UTC
    const utcDate = new Date();

    // Ajustar la fecha restando 5 horas para la zona horaria de Guayaquil (UTC -5)
    utcDate.setHours(utcDate.getHours() - 5);

    // Convertir la fecha ajustada a formato YYYY-MM-DD
    return utcDate.toISOString().slice(0, 10);
  }

}