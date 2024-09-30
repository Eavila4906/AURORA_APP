import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { AplicacionesService } from './services/aplicaciones.service';

interface App {
  app: string;
  description: string;
  status: number;
}

@Component({
  selector: 'app-aplicaciones',
  templateUrl: './aplicaciones.component.html',
  styleUrls: ['./aplicaciones.component.css']
})
export class AplicacionesComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  apps: any[] = [];
  id: number = 0;
  app: string = '';
  description: string = '';
  status: number = 1;

  newApp: App = {
    app: '',
    description: '',
    status: 1
  };

  //Search
  search: string = '';
  appsFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newApp.app = '';
    this.newApp.description = '';
    this.newApp.status = 1;
  }

  constructor(
    private AppService: AppService,
    private AplicacionesService: AplicacionesService,
    private toastr:ToastrService,
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

    this.AplicacionesService.getAll().subscribe( 
      response => {
        this.apps = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        }).sort((a: any, b: any) => b.id - a.id);
        
        this.appsFilter = this.apps;
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
    this.getApp(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getApp(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getApp(id: number) {
    this.AplicacionesService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.app = response.data.app;
        this.description = response.data.description;
        this.status = response.data.status;
      }
    );
  }

  create() {
    let data = {
      app: this.newApp.app, 
      description: this.newApp.description, 
      status: this.newApp.status
    };

    this.AplicacionesService.create(data).subscribe(
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
      app: this.app, 
      description: this.description, 
      status: this.status
    };

    this.AplicacionesService.edit(data).subscribe(
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
        this.AplicacionesService.delete(id).subscribe(
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
    this.appsFilter = this.apps.filter((app: { app: string, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = app.app.toLowerCase().includes(this.search.toLowerCase()) || 
        app.r_status.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.appsFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
