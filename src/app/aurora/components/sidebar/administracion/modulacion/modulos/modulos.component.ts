import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/service/app.service';
import { ModulosService } from './services/modulos.service';

interface Module {
  module: string;
  path: string;
  description: string;
  icon: string;
  status: number;
}

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.css']
})
export class ModulosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  modules: any[] = [];
  id: number = 0;
  module: string = '';
  path: string = '';
  description: string = '';
  icon: string = '';
  status: number = 1;

  newModule: Module = {
    module: '',
    path: '',
    description: '',
    icon: '',
    status: 1
  };

  //Search
  search: string = '';
  modulesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newModule.module = '';
    this.newModule.path = '';
    this.newModule.description = '';
    this.newModule.icon = '';
    this.newModule.status = 1;
  }

  constructor(
    private AppService: AppService,
    private ModulosService: ModulosService,
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

    this.ModulosService.getAll().subscribe( 
      response => {
        this.modules = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        });
        this.modulesFilter = this.modules;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );  
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getModule(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getModule(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getModule(id: number) {
    this.ModulosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.module = response.data.module;
        this.path = response.data.path;
        this.description = response.data.description;
        this.icon = response.data.icon;
        this.status = response.data.status;
      }
    );
  }

  create() {
    let data = {
      module: this.newModule.module, 
      path: this.newModule.path, 
      description: this.newModule.description, 
      icon: this.newModule.icon, 
      status: this.newModule.status
    };

    this.ModulosService.create(data).subscribe(
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
      module: this.module, 
      path: this.path, 
      description: this.description, 
      icon: this.icon, 
      status: this.status
    };

    this.ModulosService.edit(data).subscribe(
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
        this.ModulosService.delete(id).subscribe(
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
    this.modulesFilter = this.modules.filter((module: { module: string, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = module.module.toLowerCase().includes(this.search.toLowerCase()) || 
        module.r_status.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.modulesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
