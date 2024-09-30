import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { EstablecimientosService } from './services/establecimientos.service'; 

interface Establecimiento {
  establecimiento: string;
  descripcion: string;
}

@Component({
  selector: 'app-establecimientos',
  templateUrl: './establecimientos.component.html',
  styleUrls: ['./establecimientos.component.css']
})
export class EstablecimientosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  establecimientos: any[] = [];
  id: number = 0;
  establecimiento: string = '';
  descripcion: string = '';
  estado: string = 'Activo';

  newEstablecimiento: Establecimiento = {
    establecimiento: '',
    descripcion: ''
  };

  //Search
  search: string = '';
  establecimientosFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newEstablecimiento.establecimiento = '';
    this.newEstablecimiento.descripcion = '';
  }

  constructor(
    private AppService: AppService,
    private EstablecimientosService: EstablecimientosService,
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

    this.EstablecimientosService.getAll().subscribe( 
      response => {
        this.establecimientos = response.data.sort((a: any, b: any) => b.id - a.id);
        this.establecimientosFilter = this.establecimientos;
        this.loading = false;
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
    this.getEstablecimiento(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getEstablecimiento(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getEstablecimiento(id: number) {
    this.EstablecimientosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.establecimiento = response.data.establecimiento;
        this.descripcion = response.data.descripcion;
        this.estado = response.data.estado;
      }
    );
  }

  create() {
    let data = {
      data: {
        establecimiento: this.newEstablecimiento.establecimiento, 
        descripcion: this.newEstablecimiento.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.EstablecimientosService.create(data).subscribe(
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
      data: {
        id: id,
        establecimiento: this.establecimiento, 
        descripcion: this.descripcion, 
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.EstablecimientosService.edit(data).subscribe(
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
        this.EstablecimientosService.delete(id).subscribe(
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
    this.establecimientosFilter = this.establecimientos.filter((establecimiento: { establecimiento: string, estado: string }) => {
      let filter = true;
      if (this.search) {
        filter = establecimiento.establecimiento.toLowerCase().includes(this.search.toLowerCase()) || 
        establecimiento.estado.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.establecimientosFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}