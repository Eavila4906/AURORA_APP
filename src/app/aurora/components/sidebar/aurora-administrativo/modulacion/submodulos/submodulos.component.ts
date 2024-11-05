import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { SubmodulosService } from './services/submodulos.service';
import { ModulosService } from '../modulos/services/modulos.service';
import { AplicacionesService } from '../../aplicaciones/services/aplicaciones.service'; 

interface Submodule {
  app_id: number;
  submodule: string;
  module_id: number;
  path: string;
  description: string;
  icon: string;
  status: number;
}

@Component({
  selector: 'app-submodulos',
  templateUrl: './submodulos.component.html',
  styleUrls: ['./submodulos.component.css']
})
export class SubmodulosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  submodules: any[] = [];
  apps: any[] = [];
  modules: any[] = [];
  id: number = 0;
  submodule: string = '';
  app_id: number = 0;
  app: string = '';
  module_id: number = 0;
  module: string = '';
  path: string = '';
  description: string = '';
  icon: string = '';
  status: number = 1;

  newSubmodule: Submodule = {
    app_id: 0,
    submodule: '',
    module_id: 0,
    path: '',
    description: '',
    icon: '',
    status: 1
  };

  //Search
  search: string = '';
  submodulesFilter: any[] = [];
  modulesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newSubmodule.app_id = 0;
    this.newSubmodule.submodule = '';
    this.newSubmodule.module_id = 0;
    this.newSubmodule.path = '';
    this.newSubmodule.description = '';
    this.newSubmodule.icon = '';
    this.newSubmodule.status = 1;
  }

  constructor(
    private AppService: AppService,
    private SubmodulosService: SubmodulosService, 
    private ModulesService: ModulosService,
    private AplicacionesService: AplicacionesService,
    private toastr: ToastrService,
    private router: Router
  ) { }

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

    this.SubmodulosService.getAll().subscribe( 
      response => {
        this.submodules = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        }).sort((a: any, b: any) => b.id - a.id);
        
        this.submodulesFilter = this.submodules;
      }
    ); 
    
    this.getModules();
    this.getApps();
  }

  /**
   * MODALS
   */
  openModalCreate() {
    this.modulesFilter = this.modules.filter(module => module.aurora_app.id == this.newSubmodule.app_id);
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getSubmodule(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getSubmodule(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */
  getSubmodule(id: number) {
    this.SubmodulosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.submodule = response.data.submodule;
        this.module_id = response.data.module_id;
        this.app_id = response.data.aurora_app.id;
        this.app = response.data.aurora_app.app;
        this.module = response.data.module.module;
        this.path = response.data.path;
        this.description = response.data.description;
        this.icon = response.data.icon;
        this.status = response.data.status;

        this.modulesFilter = this.modules.filter(module => module.aurora_app.id == this.app_id);
      }
    );
  }

  getModules () {
    this.ModulesService.getAll().subscribe( 
      response => {
        this.modules = response.data.filter( (app: any) => app.status === 1);
        this.modulesFilter = this.modules;
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

  create() {
    let data = {
      app_id: this.newSubmodule.app_id,
      submodule: this.newSubmodule.submodule, 
      module_id: this.newSubmodule.module_id,
      path: this.newSubmodule.path, 
      description: this.newSubmodule.description, 
      icon: this.newSubmodule.icon, 
      status: this.newSubmodule.status
    };

    this.SubmodulosService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', {closeButton: true});
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
      submodule: this.submodule, 
      module_id: this.module_id,
      path: this.path, 
      description: this.description, 
      icon: this.icon, 
      status: this.status
    };

    this.SubmodulosService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', {closeButton: true});
          this.ngOnInit();
          this.ModalEdit?.hide();
          this.resetForm();
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
        this.SubmodulosService.delete(id).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', {closeButton: true});
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
  Search() {
    this.submodulesFilter = this.submodules.filter((submodule: { submodule: string, module: { module: string }, aurora_app: {app: string}, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = submodule.submodule.toLowerCase().includes(this.search.toLowerCase()) || 
        submodule.module.module.toLowerCase().includes(this.search.toLowerCase()) || 
        submodule.aurora_app.app.toLowerCase().includes(this.search.toLowerCase()) || 
        submodule.r_status.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.submodulesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  onAppChange(op: number) {
    let app_id = op === 1 ? this.newSubmodule.app_id : this.app_id;
    this.modulesFilter = this.modules.filter(module => module.aurora_app.id == app_id);
    this.module_id = 0;
  }
  
}
