import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { AbonosService } from './services/abonos.service';

interface Abono {
  cabFactura_id: number;
  monto: number;
  fecha: string;
  descripcion: string;
}

@Component({
  selector: 'app-abonos',
  templateUrl: './abonos.component.html',
  styleUrls: ['./abonos.component.css']
})
export class AbonosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  abonos: any[] = [];
  id: number = 0;
  cabFactura_id: number = 0;
  codigoFactura: string = '';
  monto: number = 0;
  fecha: string = this.AppService.getTimeZoneCurrentDate();
  descripcion: string = '';
  estado: string = 'Activo';

  newAbono: Abono = {
    cabFactura_id: 0,
    monto: 0,
    fecha: this.AppService.getTimeZoneCurrentDate(),
    descripcion: ''
  };

  //Search
  search: string = '';
  abonosFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newAbono.cabFactura_id = 0;
    this.newAbono.monto = 0;
    this.newAbono.fecha = '';
    this.newAbono.descripcion = '';

    this.id = 0;
    this.cabFactura_id = 0;
    this.monto = 0;
    this.fecha = this.AppService.getTimeZoneCurrentDate();
    this.descripcion = '';
  }

  constructor(
    private AppService: AppService,
    private AbonosService: AbonosService,
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

    this.AbonosService.getAll().subscribe(
      response => {
        this.abonos = response.data.sort((a: any, b: any) => b.id - a.id);
        // Crear un mapa para identificar el último abono por cada factura
        const ultimoAbonoMap = new Map<number, any>();

        this.abonos.forEach((abono: any) => {
          const facturaId = abono.cabFactura_id;

          // Si el abono actual es más reciente o no hay aún un último abono, se asigna
          if (!ultimoAbonoMap.has(facturaId) || abono.fecha > ultimoAbonoMap.get(facturaId).fecha) {
            ultimoAbonoMap.set(facturaId, abono);
          }
        });

        // Marcar cada abono con 'ultimoAbono' true o false
        this.abonos = this.abonos.map((abono: any) => {
          return {
            ...abono,
            ultimoAbono: abono.id === ultimoAbonoMap.get(abono.cabFactura_id).id
          };
        });
        this.abonosFilter = this.abonos;
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
    this.getAbono(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getAbono(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getAbono(id: number) {
    this.AbonosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.cabFactura_id = response.data.cabFactura_id,
        this.codigoFactura = response.data.cab_factura.codigoFactura;
        this.monto = response.data.monto,
        this.fecha = response.data.fecha,
        this.descripcion = response.data.descripcion
      }
    );
  }

  create() {
    let data = {
      data: {
        cabFactura_id: this.newAbono.cabFactura_id,
        monto: this.newAbono.monto,
        fecha: this.newAbono.fecha,
        descripcion: this.newAbono.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.AbonosService.create(data).subscribe(
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
        cabFactura_id: this.cabFactura_id,
        monto: this.monto,
        fecha: this.fecha,
        descripcion: this.descripcion,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.AbonosService.edit(data).subscribe(
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
        this.AbonosService.delete(id).subscribe(
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
    this.abonosFilter = this.abonos.filter((abono: {
      cab_factura: { codigoFactura: string },
      fecha: string,
      descripcion: string
    }) => {
      let filter = true;
      if (this.search) {
        filter = abono.cab_factura.codigoFactura?.toLowerCase().includes(this.search.toLowerCase()) ||
          abono.fecha?.toLowerCase().includes(this.search.toLowerCase()) ||
          abono.descripcion?.toLowerCase().includes(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.abonosFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
