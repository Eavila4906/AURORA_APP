import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";

import { AppService } from 'src/app/services/app.service';
import { CuentasPorCobrarService } from './services/cuentas-por-cobrar.service';
import { AbonosService } from '../abonos/services/abonos.service';  
interface Abono {
  cabFactura_id: number;
  monto: number;
  fecha: string;
  descripcion: string;
}
@Component({
  selector: 'app-cuentas-por-cobrar',
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.css']
})
export class CuentasPorCobrarComponent implements OnInit {
  @ViewChild('ModalNewAbono') ModalNewAbono?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  fechaInicio: string = this.AppService.getTimeZoneCurrentDate();
  fechaFin: string = this.AppService.getTimeZoneCurrentDate();

  cabFactura_id: number = 0;
  dataPrintComprobante: any;

  newAbono: Abono = {
    cabFactura_id: 0,
    monto: 0,
    fecha: this.AppService.getTimeZoneCurrentDate(),
    descripcion: ''
  };

  cuentasPorCobrar: any[] = [];

  //Search
  searchByRange: boolean = false;
  search: string = '';
  cuentasPorCobrarFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newAbono.cabFactura_id = 0;
    this.newAbono.monto = 0;
    this.newAbono.fecha = '';
    this.newAbono.descripcion = '';

    this.cabFactura_id = 0;
  }

  constructor(
    private AppService: AppService,
    private CuentasPorCobrarService: CuentasPorCobrarService,
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

    this.CuentasPorCobrarService.getAll().subscribe(
      response => {
        this.cuentasPorCobrar = response.data.map((factura: any) => {
          // Verificar si la factura tiene abonos
          if (factura.abonos && factura.abonos.length > 0) {
            // Sumar el total de los abonos
            factura.totalAbonos = factura.abonos
              .map((abono: any) => parseFloat(abono.monto))
              .reduce((sum: number, monto: number) => sum + monto, 0);
    
            // Obtener el saldo del último abono
            const ultimoAbono = factura.abonos[factura.abonos.length - 1];
            factura.saldo = ultimoAbono.saldo;
          } else {
            factura.totalAbonos = 0;
            factura.saldo = factura.total;
          }
          return factura;
        }).sort((a: any, b: any) => b.id - a.id);
        this.cuentasPorCobrarFilter = this.cuentasPorCobrar;
        this.loading = false;
      }
    );
  }

  /**
   * MODALS
   */

  openModalAbonar(data: any) {
    this.dataPrintComprobante = data;
    this.cabFactura_id = data.id;
    this.ModalNewAbono?.show();
  }

  /**
   * SERVICES
   */

  pagar(dataCuenta: any) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Deseas completar el pago de esta cuenta por cobrar?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, pagar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        let data = {
          data: {
            cabFactura_id: dataCuenta.id,
            auditoria: this.AppService.getDataAuditoria('edit')
          }
        };
    
        this.CuentasPorCobrarService.pagarCuenta(data).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', { closeButton: true });
              this.ngOnInit();
              Swal.fire({
                icon: 'warning',
                title: '<strong>¿Desea imprimir el comprobante?</strong>',
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: 'Si, imprimir',
                cancelButtonText: 'No, cancelar'
              }).then((result) => {
                if (result.isConfirmed) {
                  this.comprobante(dataCuenta, response.data.factura, 1);
                }
              });
            }
          }
        );
      }
    });
  }

  abonar() {
    let data = {
      data: {
        cabFactura_id: this.cabFactura_id,
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
          this.ModalNewAbono?.hide();
          Swal.fire({
            icon: 'warning',
            title: '<strong>¿Desea imprimir el comprobante?</strong>',
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText: 'Si, imprimir',
            cancelButtonText: 'No, cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.comprobante(this.dataPrintComprobante, response.data, 2);
            }
          });
        }
      }
    );
  }

  byRange() {
    let data = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    };
    
    this.loading = true;

    this.CuentasPorCobrarService.byRange(data).subscribe(
      response => {
        this.cuentasPorCobrar = response.data.map((factura: any) => {
          // Verificar si la factura tiene abonos
          if (factura.abonos && factura.abonos.length > 0) {
            // Sumar el total de los abonos
            factura.totalAbonos = factura.abonos
              .map((abono: any) => parseFloat(abono.monto))
              .reduce((sum: number, monto: number) => sum + monto, 0);
    
            // Obtener el saldo del último abono
            const ultimoAbono = factura.abonos[factura.abonos.length - 1];
            factura.saldo = ultimoAbono.saldo;
          } else {
            factura.totalAbonos = 0;
            factura.saldo = factura.total;
          }
          return factura;
        }).sort((a: any, b: any) => b.id - a.id);
        this.cuentasPorCobrarFilter = this.cuentasPorCobrar
        this.loading = false;
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    this.cuentasPorCobrarFilter = this.cuentasPorCobrar.filter((cuenta: { 
      fechaEmision: string,
      receptor: { nombres: string }
    }) => {
      let filter = true;
      if (this.search) {
        filter = cuenta.fechaEmision?.toLowerCase().includes(this.search.toLowerCase()) ||
        cuenta.receptor.nombres?.toLowerCase().includes(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.cuentasPorCobrarFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  onCheckboxChange(event: any): void {
    this.searchByRange = event.target.checked;
  }

  // Imprimir comprobante
  public comprobante(data: any, dataAbono: any, op: number) {
    let body = {};
    let tipoComprobante;
    let estado;
    let abonos = data.abonos.map((item: any) => [
      { text: item.monto, style: 'tableBody', alignment: 'left' },
      { text: item.saldo, style: 'tableBody', alignment: 'left' },
      { text: item.fecha, style: 'tableBody', alignment: 'left' },
    ]);

    if (op === 1) {
      tipoComprobante = 'PAGO';
      estado = 'Pagada';
      body = {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Descripción', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] },
              { text: 'Monto', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] }
            ],
            [
              { text: 'Cuenta pagada', style: 'tableBody', alignment: 'left' },
              { text: data.total, style: 'tableBody', alignment: 'left' },
            ]
          ]
        },
        layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
      }
    } else {
      tipoComprobante = 'ABONOS';
      estado = 'Por pagar'
      abonos.push([
        { text: dataAbono.monto, style: 'tableBody', alignment: 'left' },
        { text: dataAbono.saldo, style: 'tableBody', alignment: 'left' },
        { text: dataAbono.fecha, style: 'tableBody', alignment: 'left' },
      ]);

      body = {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Monto', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] },
              { text: 'Saldo', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] },
              { text: 'Fecha', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] }
            ],
            ...abonos
          ]
        },
        layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
      }
    }

    const docDefinition: any = {
      pageSize: {
        width: 156,
        height: 'auto'
      },
      pageMargins: [8, 8, 8, 8], // Márgenes personalizados (izquierda, arriba, derecha, abajo)
      content: [
        '***************************',
        { text: `COMPROBANTE DE ${tipoComprobante}`, style: 'header', alignment: 'center' },
        '------------------------------------------',
        { text: `Código: ${dataAbono.codigoFactura}`, style: 'info'},
        { text: `Cliente: ${data.receptor.nombres}`, style: 'dataCliente' },
        { text: `RUC/Ced/Pass: ${data.receptor.numeroIdentificacion}`, style: 'dataCliente' },
        '***************************',
        body,
        '***************************',
        { text: `Subtotal sin IVA: $${data.subtotalSinIva}`, style: 'totales', alignment: 'right' },
        { text: `Subtotal con IVA: $${data.subtotalConIva}`, style: 'totales', alignment: 'right' },
        { text: `Total descuento: $${data.totalDescuento}`, style: 'totales', alignment: 'right' },
        { text: `Total IVA: $${data.totalIva}`, style: 'totales', alignment: 'right' },
        { text: `Total: $${data.total}`, style: 'totales', alignment: 'right' },
        '------------------------------------------',
        { 
          text: `Estado: ${estado }`, style: 'info', alignment: 'right'
        }    
      ],
      styles: {
        header: { fontSize: 12, bold: true },
        titleEmpresa: { fontSize: 10, bold: true },
        titles: { fontSize: 8, bold: true },
        info: { fontSize: 8 },
        dataCliente: { fontSize: 8 },
        totales: { fontSize: 8 },
        tableHeader: { fontSize: 8, bold: true },
        tableBody: { fontSize: 7, bold: true }
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }

}
