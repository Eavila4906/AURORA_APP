import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { MovimientosContablesService } from './services/movimientos-contables.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';

interface Movimiento {
  tipo: string;
  monto: number;
  fecha: string;
  descripcion: string;
}

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  movimientos: any[] = [];
  id: number = 0;
  tipo: string = 'Seleccionar';
  monto: number = 0;
  fecha: string = new Date().toISOString().slice(0, 10);
  descripcion: string = '';
  estado: string = 'Activo';

  newMovimiento: Movimiento = {
    tipo: 'Seleccionar',
    monto: 0,
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: ''
  };

  //Search
  search: string = '';
  movimientosFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newMovimiento.tipo = 'Seleccionar';
    this.newMovimiento.monto = 0;
    this.newMovimiento.fecha = '';
    this.newMovimiento.descripcion = '';

    this.id = 0;
    this.tipo = '0';
    this.monto = 0;
    this.fecha = new Date().toISOString().slice(0, 10);
    this.descripcion = '';
  }

  constructor(
    private AppService: AppService,
    private MovimientosContablesService: MovimientosContablesService,
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

    this.MovimientosContablesService.getAll().subscribe(
      response => {
        this.movimientos = response.data.sort((a: any, b: any) => b.id - a.id);
        this.movimientosFilter = this.movimientos;
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
    this.getMovimiento(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getMovimiento(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getMovimiento(id: number) {
    this.MovimientosContablesService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.tipo = response.data.tipo,
        this.monto = response.data.monto,
        this.fecha = response.data.fecha,
        this.descripcion = response.data.descripcion
      }
    );
  }

  create() {
    let data = {
      data: {
        tipo: this.newMovimiento.tipo,
        monto: this.newMovimiento.monto,
        fecha: this.newMovimiento.fecha,
        descripcion: this.newMovimiento.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.MovimientosContablesService.create(data).subscribe(
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
      data: {
        id: id,
        tipo: this.tipo,
        monto: this.monto,
        fecha: this.fecha,
        descripcion: this.descripcion,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.MovimientosContablesService.edit(data).subscribe(
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
        this.MovimientosContablesService.delete(id).subscribe(
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
  Search() {
    this.movimientosFilter = this.movimientos.filter((movimiento: {
      tipo: string,
      fecha: string,
      descripcion: string
    }) => {
      let filter = true;
      if (this.search) {
        filter = movimiento.tipo?.toLowerCase().includes(this.search.toLowerCase()) ||
          movimiento.fecha?.toLowerCase().includes(this.search.toLowerCase()) ||
          movimiento.descripcion?.toLowerCase().includes(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.movimientosFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
