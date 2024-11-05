import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { PuntosDeEmisionService } from './services/puntos-de-emision.service';
import { EstablecimientosService } from '../establecimientos/services/establecimientos.service';

interface PuntoDeEmision {
  establecimiento_id: number;
  puntoEmision: string;
  factura: number;
  notaCredito: number;
  notaDebito: number;
  comprobanteRetencion: number;
  liquidacionCompra: number;
  guiaRemision: number;
  descripcion: string;
}

@Component({
  selector: 'app-puntos-de-emision',
  templateUrl: './puntos-de-emision.component.html',
  styleUrls: ['./puntos-de-emision.component.css']
})
export class PuntosDeEmisionComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  puntosDeEmision: any[] = [];
  id: number = 0;
  establecimiento_id: number = 0;
  puntoEmision: string = '';
  factura: number = 0;
  notaCredito: number = 0;
  notaDebito: number = 0;
  comprobanteRetencion: number = 0;
  liquidacionCompra: number = 0;
  guiaRemision: number = 0;
  descripcion: string = '';
  estado: string = 'Activo';

  establecimientos: any[] = [];
  nombreEstablecimiento: string = '';

  newPuntoDeEmision: PuntoDeEmision = {
    establecimiento_id: 0,
    puntoEmision: '',
    factura: 0,
    notaCredito: 0,
    notaDebito: 0,
    comprobanteRetencion: 0,
    liquidacionCompra: 0,
    guiaRemision: 0,
    descripcion: ''
  };

  //Search
  search: string = '';
  puntosDeEmisionFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newPuntoDeEmision.establecimiento_id = 0;
    this.newPuntoDeEmision.puntoEmision = '';
    this.newPuntoDeEmision.factura = 0;
    this.newPuntoDeEmision.notaCredito = 0;
    this.newPuntoDeEmision.notaDebito = 0;
    this.newPuntoDeEmision.comprobanteRetencion = 0;
    this.newPuntoDeEmision.liquidacionCompra = 0;
    this.newPuntoDeEmision.guiaRemision = 0;
    this.newPuntoDeEmision.descripcion = '';
    
    this.establecimiento_id = 0;
  }

  constructor(
    private AppService: AppService,
    private PuntosDeEmisionService: PuntosDeEmisionService,
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

    this.PuntosDeEmisionService.getAll().subscribe( 
      response => {
        this.puntosDeEmision = response.data.sort((a: any, b: any) => b.id - a.id);
        this.puntosDeEmisionFilter = this.puntosDeEmision;
        this.loading = false;
      }
    );  

    this.getEstablecimientos();
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getPuntoDeEmision(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getPuntoDeEmision(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getPuntoDeEmision(id: number) {
    this.PuntosDeEmisionService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.establecimiento_id = response.data.establecimiento_id;
        this.nombreEstablecimiento = response.data.nombreEstablecimiento;
        this.puntoEmision = response.data.puntoEmision;
        this.factura = response.data.factura;
        this.notaCredito = response.data.notaCredito;
        this.notaDebito = response.data.notaDebito;
        this.comprobanteRetencion = response.data.comprobanteRetencion;
        this.liquidacionCompra = response.data.liquidacionCompra;
        this.guiaRemision = response.data.guiaRemision;
        this.descripcion = response.data.descripcion;
        this.estado = response.data.estado;
      }
    );
  }

  getEstablecimientos() {
    this.EstablecimientosService.getAll().subscribe( 
      response => {
        this.establecimientos = response.data.filter((puntoDeEmision: any) => puntoDeEmision.estado === 'Activo');
      }
    );
  }

  create() {
    let data = {
      data: {
        establecimiento_id: this.newPuntoDeEmision.establecimiento_id, 
        puntoEmision: this.newPuntoDeEmision.puntoEmision,
        factura: this.newPuntoDeEmision.factura,
        notaCredito: this.newPuntoDeEmision.notaCredito,
        notaDebito: this.newPuntoDeEmision.notaDebito,
        comprobanteRetencion: this.newPuntoDeEmision.comprobanteRetencion,
        liquidacionCompra: this.newPuntoDeEmision.liquidacionCompra,
        guiaRemision: this.newPuntoDeEmision.guiaRemision,
        descripcion: this.newPuntoDeEmision.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.PuntosDeEmisionService.create(data).subscribe(
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
        establecimiento_id: this.establecimiento_id, 
        puntoEmision: this.puntoEmision,
        factura: this.factura,
        notaCredito: this.notaCredito,
        notaDebito: this.notaDebito,
        comprobanteRetencion: this.comprobanteRetencion,
        liquidacionCompra: this.liquidacionCompra,
        guiaRemision: this.guiaRemision,
        descripcion: this.descripcion, 
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.PuntosDeEmisionService.edit(data).subscribe(
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
        this.PuntosDeEmisionService.delete(id).subscribe(
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
    this.puntosDeEmisionFilter = this.puntosDeEmision.filter((puntoDeEmision: { puntoEmision: string, estado: string }) => {
      let filter = true;
      if (this.search) {
        filter = puntoDeEmision.puntoEmision.toLowerCase().includes(this.search.toLowerCase()) || 
        puntoDeEmision.estado.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.puntosDeEmisionFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
