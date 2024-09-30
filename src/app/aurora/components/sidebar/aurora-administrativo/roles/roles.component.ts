import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { RolesService } from './services/roles.service';
import { AplicacionesService } from '../aplicaciones/services/aplicaciones.service';

interface role {
  app_id: number;
  rol: string;
  description: string;
  status: number;
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;
  @ViewChild('ModalPermissions') ModalPermissions?: ModalDirective;

  modules: any[] = [];
  submodules: any[] = [];
  items: any[] = [];
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  roles: any[] = [];
  apps: any[] = [];
  id: number = 0;
  app_id: number = 0;
  app: string = '';
  rol: string = '';
  description: string = '';
  status: number = 1;

  newRole: role = {
    app_id: 0,
    rol: '',
    description: '',
    status: 1
  };

  opcion: string = '1';

  //Search
  search: string = '';
  searchModules: string = '';
  searchSubmodules: string = '';
  searchItems: string = '';
  rolesFilter: any[] = [];
  modulesFilter: any[] = [];
  submodulesFilter: any[] = [];
  itemsFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  constructor(
    private AppService: AppService,
    private RolesService: RolesService,
    private AplicacionesService: AplicacionesService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  resetForm() {
    this.newRole.app_id = 0;
    this.newRole.rol = '';
    this.newRole.description = '';
    this.newRole.status = 1;
  }

  ngOnInit(): void {
    const modulo = this.AppService.getEntityModulation(this.router.url)[0];

    this.AppService.getPermissions(modulo.id, modulo.type).subscribe(
      response => {
        this.permission_read = response.data.r == 1 ? true : false;
        this.permission_create = response.data.w == 1 ? true : false;
        this.permission_update = response.data.u == 1 ? true : false;
        this.permission_delete = response.data.d == 1 ? true : false;
      }
    );

    this.RolesService.getAll().subscribe(
      response => {
        this.roles = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        }).sort((a: any, b: any) => b.id - a.id);
        
        this.rolesFilter = this.roles;
      }
    );

    this.getApps();
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getRole(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getRole(id);
    this.ModalSee?.show();
  }

  openModalPermissions(id: number) {
    this.id = id;
    this.modules = [];
    this.submodules = [];
    this.items = [];
    this.opcion = '1';
    this.getPermisos(id, this.opcion);
    this.ModalPermissions?.show();
  }

  /**
   * SERIVECES
   */
  getRole(id: number) {
    this.RolesService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.app_id = response.data.aurora_app.id;
        this.app = response.data.aurora_app.app;
        this.rol = response.data.rol;
        this.description = response.data.description;
        this.status = response.data.status;
      }
    );
  }

  getApps() {
    this.AplicacionesService.getAll().subscribe(
      response => {
        this.apps = response.data.filter( (app: any) => app.status === 1);
      }
    );
  }

  getPermisos(id: number, opcion: string) {
    this.modules = [];
    this.submodules = [];
    this.items = [];

    if (opcion == '1') {
      this.RolesService.getPermissions(id).subscribe(
        response => {
          this.id = response.data.role;
          this.modules = response.data.modules;
          this.modulesFilter = this.modules;
        }
      );
    } else if (opcion == '2') {
      this.RolesService.getPermissionsSubmodulos(id).subscribe(
        response => {
          this.id = response.data.role;
          this.submodules = response.data.submodules;
          this.submodulesFilter = this.submodules;
        }
      );
    } else if (opcion == '3') {
      this.RolesService.getPermissionsItems(id).subscribe(
        response => {
          this.id = response.data.role;
          this.items = response.data.items;
          this.itemsFilter = this.items;
        }
      );
    }
  }

  create() {
    let data = { 
      app_id: this.newRole.app_id,
      rol: this.newRole.rol, 
      description: this.newRole.description, 
      status: this.newRole.status 
    };

    this.RolesService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetForm();
          this.ModalNew?.hide();
        }
      }
    );
  }

  edit(id: number) {
    let data = { 
      id: id, 
      app_id: this.app_id,
      rol: this.rol, 
      description: this.description, 
      status: this.status 
    };

    this.RolesService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.ModalEdit?.hide();
          this.resetForm();
        }
      }
    );
  }

  assignPermissions() {
    let data = new FormData();
    data.append('rol', this.id.toString());
    this.modulesFilter.forEach((module, i) => {
      data.append(`module[${i}][id]`, module.id);
      data.append(`module[${i}][r]`, module.permissions['r'] ? 'on' : '');
      data.append(`module[${i}][w]`, module.permissions['w'] ? 'on' : '');
      data.append(`module[${i}][u]`, module.permissions['u'] ? 'on' : '');
      data.append(`module[${i}][d]`, module.permissions['d'] ? 'on' : '');
    });

    this.RolesService.assignPermissions(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.getPermisos(this.id, '1');
        }
      }
    );
  }

  assignPermissionsSubmodules() {
    let data = new FormData();
    data.append('rol', this.id.toString());
    this.submodulesFilter.forEach((submodule, i) => {
      data.append(`submodule[${i}][id]`, submodule.id);
      data.append(`submodule[${i}][r]`, submodule.permissions['r'] ? 'on' : '');
      data.append(`submodule[${i}][w]`, submodule.permissions['w'] ? 'on' : '');
      data.append(`submodule[${i}][u]`, submodule.permissions['u'] ? 'on' : '');
      data.append(`submodule[${i}][d]`, submodule.permissions['d'] ? 'on' : '');
    });
    
    this.RolesService.assignPermissionsSubmodulos(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.getPermisos(this.id, '2');
        }
      }
    );
  }

  assignPermissionsItems() {
    let data = new FormData();
    data.append('rol', this.id.toString());
    this.itemsFilter.forEach((item, i) => {
      data.append(`item[${i}][id]`, item.id);
      data.append(`item[${i}][r]`, item.permissions['r'] ? 'on' : '');
      data.append(`item[${i}][w]`, item.permissions['w'] ? 'on' : '');
      data.append(`item[${i}][u]`, item.permissions['u'] ? 'on' : '');
      data.append(`item[${i}][d]`, item.permissions['d'] ? 'on' : '');
    });

    this.RolesService.assignPermissionsItems(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.getPermisos(this.id, '3');
        }
      }
    );
  }

  delete(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.RolesService.delete(id).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', { closeButton: true });
              this.ngOnInit();
              this.resetForm();
            }
          }
        );
      }
    });
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  clearSearch() {
    this.search = '';
    this.searchModules = '';
    this.searchSubmodules = '';
    this.searchItems = '';
  }

  Search(op: number) {
    if (op === 1) {
      this.rolesFilter = this.roles.filter((rol: { rol: string, aurora_app: {app: string}, r_status: string }) => {
        let filter = true;
        if (this.search) {
          filter = rol.rol.toString().toLowerCase().includes(this.search.toLowerCase()) ||
            rol.aurora_app.app.toLowerCase().includes(this.search.toLowerCase()) ||
            rol.r_status.toLowerCase().startsWith(this.search.toLowerCase());
        }
        return filter;
      });
    } else if (op === 2) {
      this.modulesFilter = this.modules.filter((module: { module: string }) => {
        let filter = true;
        if (this.searchModules) {
          filter = module.module.toString().toLowerCase().includes(this.searchModules.toLowerCase());
        }
        return filter;
      });
    } else if (op === 3) {
      this.submodulesFilter = this.submodules.filter((submodule: { module: {module: string}, submodule: string }) => {
        let filter = true;
        if (this.searchSubmodules) {
          filter = submodule.submodule.toString().toLowerCase().includes(this.searchSubmodules.toLowerCase()) ||
          submodule.module.module.toLowerCase().includes(this.searchSubmodules.toLowerCase());
        }
        return filter;
      });
    } else if (op === 4) {
      this.itemsFilter = this.items.filter((item: { submodule: {submodule: string}, item: string }) => {
        let filter = true;
        if (this.searchItems) {
          filter = item.item.toString().toLowerCase().includes(this.searchItems.toLowerCase()) ||
          item.submodule.submodule.toLowerCase().includes(this.searchItems.toLowerCase());
        }
        return filter;
      });
    }
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.rolesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  updateToggleAll(index: number, op: number) {
    let item;
    
    if (op === 1) {
      item = this.modulesFilter[index];
    } else if (op === 2) {
      item = this.submodulesFilter[index];
    } else {
      item = this.itemsFilter[index];
    }

    const allChecked = item.permissions['r'] && item.permissions['w'] && item.permissions['u'] && item.permissions['d'];

    if (allChecked) {
      if (op === 1) {
        this.modulesFilter[index].allPermissionsChecked = true;
      } else if (op === 2) {
        this.submodulesFilter[index].allPermissionsChecked = true;
      } else {
        this.itemsFilter[index].allPermissionsChecked = true;
      }
    } else {
      if (op === 1) {
        this.modulesFilter[index].allPermissionsChecked = false;
      } else if (op === 2) {
        this.submodulesFilter[index].allPermissionsChecked = false;
      } else {
        this.itemsFilter[index].allPermissionsChecked = false;
      }
    }

  }

  toggleAllPermissions(index: number, event: any, op: number) {
    const isChecked = event.target.checked;

    if (op === 1) {
      this.modulesFilter[index].permissions['r'] = isChecked ? 1 : 0;
      this.modulesFilter[index].permissions['w'] = isChecked ? 1 : 0;
      this.modulesFilter[index].permissions['u'] = isChecked ? 1 : 0;
      this.modulesFilter[index].permissions['d'] = isChecked ? 1 : 0;
    } else if (op === 2) {
      this.submodulesFilter[index].permissions['r'] = isChecked ? 1 : 0;
      this.submodulesFilter[index].permissions['w'] = isChecked ? 1 : 0;
      this.submodulesFilter[index].permissions['u'] = isChecked ? 1 : 0;
      this.submodulesFilter[index].permissions['d'] = isChecked ? 1 : 0;
    } else {
      this.itemsFilter[index].permissions['r'] = isChecked ? 1 : 0;
      this.itemsFilter[index].permissions['w'] = isChecked ? 1 : 0;
      this.itemsFilter[index].permissions['u'] = isChecked ? 1 : 0;
      this.itemsFilter[index].permissions['d'] = isChecked ? 1 : 0;
    }

  }

  toggleAllRows(isChecked: boolean, op: number) {
    if (op === 1) {
      this.modulesFilter.forEach((module, i) => {
        this.modulesFilter[i].permissions['r'] = isChecked ? 1 : 0;
        this.modulesFilter[i].permissions['w'] = isChecked ? 1 : 0;
        this.modulesFilter[i].permissions['u'] = isChecked ? 1 : 0;
        this.modulesFilter[i].permissions['d'] = isChecked ? 1 : 0;
      });
    } else if (op === 2) {
      this.submodulesFilter.forEach((submodule, i) => {
        this.submodulesFilter[i].permissions['r'] = isChecked ? 1 : 0;
        this.submodulesFilter[i].permissions['w'] = isChecked ? 1 : 0;
        this.submodulesFilter[i].permissions['u'] = isChecked ? 1 : 0;
        this.submodulesFilter[i].permissions['d'] = isChecked ? 1 : 0;
      });
    } else {
      this.itemsFilter.forEach((item, i) => {
        this.itemsFilter[i].permissions['r'] = isChecked ? 1 : 0;
        this.itemsFilter[i].permissions['w'] = isChecked ? 1 : 0;
        this.itemsFilter[i].permissions['u'] = isChecked ? 1 : 0;
        this.itemsFilter[i].permissions['d'] = isChecked ? 1 : 0;
      });
    }

  }

}
