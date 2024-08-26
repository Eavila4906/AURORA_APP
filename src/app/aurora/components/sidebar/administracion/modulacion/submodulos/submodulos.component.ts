import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/service/app.service';
import { SubmodulosService } from './services/submodulos.service';
import { ModulosService } from '../modulos/services/modulos.service';

interface Submodule {
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
  modules: any[] = [];
  id: number = 0;
  submodule: string = '';
  module_id: number = 0;
  module: string = '';
  path: string = '';
  description: string = '';
  icon: string = '';
  status: number = 1;

  newSubmodule: Submodule = {
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

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
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
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );

    this.SubmodulosService.getAll().subscribe( 
      response => {
        this.submodules = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        });
        this.submodulesFilter = this.submodules;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    ); 
    
    this.getModules();
  }

  /**
   * MODALS
   */
  openModalCreate() {
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
        this.module = response.data.module.module;
        this.path = response.data.path;
        this.description = response.data.description;
        this.icon = response.data.icon;
        this.status = response.data.status;
      }
    );
  }

  getModules () {
    this.ModulesService.getAll().subscribe( 
      response => {
        this.modules = response.data;
      }
    ); 
  }

  create() {
    let data = {
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
      },
      error => {
        this.toastr.warning(error, '¡Atención!', {closeButton: true});
      }
    );
  }

  edit(id: number) {
    let data = {
      id: id,
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
      },
      error => {
        this.toastr.warning(error, '¡Atención!', {closeButton: true});
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
          },
          error => {
            this.toastr.warning(error, '¡Atención!', {closeButton: true});
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
    this.submodulesFilter = this.submodules.filter((submodule: { submodule: string, module: { module: string }, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = submodule.submodule.toLowerCase().includes(this.search.toLowerCase()) || 
        submodule.module.module.toLowerCase().includes(this.search.toLowerCase()) || 
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
  
}
