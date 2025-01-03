import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { TurnosConfigService } from '../services/turnos-config.service';

interface Categoria {
  fecha: string;
  max_turno: number;
  descripcion: string;
}

@Component({
  selector: 'app-configurar',
  templateUrl: './configurar.component.html',
  styleUrls: ['./configurar.component.css']
})
export class ConfigurarComponent implements OnInit {

  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  turnosConfig: any[] = [];
  id: number = 0;
  fecha: string = this.AppService.getTimeZoneCurrentDate();
  max_turno: number = 0;
  descripcion: string = '';
  estado: string = 'Activo';

  newTurnoConfig: Categoria = {
    fecha: this.AppService.getTimeZoneCurrentDate(),
    max_turno: 0,
    descripcion: ''
  };

  //Search
  search: string = '';
  turnosConfigFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newTurnoConfig.fecha = this.AppService.getTimeZoneCurrentDate();;
    this.newTurnoConfig.max_turno = 0;
  }

  constructor(
    private AppService: AppService,
    private TurnosConfigService: TurnosConfigService,
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

    this.TurnosConfigService.getAll().subscribe(
      response => {
        this.turnosConfig = response.data.sort((a: any, b: any) => b.id - a.id);
        this.turnosConfigFilter = this.turnosConfig;
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
    this.getTurnoConfig(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getTurnoConfig(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getTurnoConfig(id: number) {
    this.TurnosConfigService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.fecha = response.data.fecha;
        this.max_turno = response.data.max_turno;
        this.descripcion = response.data.descripcion;
        this.estado = response.data.estado;
      }
    );
  }

  create() {
    let data = {
      data: {
        fecha: this.newTurnoConfig.fecha,
        max_turno: this.newTurnoConfig.max_turno,
        descripcion: this.newTurnoConfig.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.TurnosConfigService.create(data).subscribe(
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
        fecha: this.fecha,
        max_turno: this.max_turno,
        descripcion: this.descripcion,
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.TurnosConfigService.edit(data).subscribe(
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
        this.TurnosConfigService.delete(id).subscribe(
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
    this.turnosConfigFilter = this.turnosConfig.filter((turnoConfig: { fecha: string, estado: string }) => {
      let filter = true;
      if (this.search) {
        filter = turnoConfig.fecha.toLowerCase().includes(this.search.toLowerCase()) ||
          turnoConfig.estado.toLowerCase().includes(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.turnosConfigFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
