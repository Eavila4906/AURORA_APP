import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";

import { AppService } from 'src/app/services/app.service';
import { ContableService } from './services/contable.service'; 
import { style } from '@angular/animations';

@Component({
  selector: 'app-contable',
  templateUrl: './contable.component.html',
  styleUrls: ['./contable.component.css']
})
export class ContableComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  fechaInicio: string = this.AppService.getTimeZoneCurrentDate();
  fechaFin: string = this.AppService.getTimeZoneCurrentDate();
  tipoOp: string = 'Dia';

  rango: string = '';
  opcion: string = '';

  cantidad_ventas: number = 0;
  total_ventas: number = 0;

  cantidad_compras: number = 0;
  total_compras: number = 0;

  cantidad_cuentasPorCobrar: number = 0;
  total_cuentasPorCobrar: number = 0;

  cantidad_cuentasPorPagar: number = 0;
  total_cuentasPorPagar: number = 0;

  cantidad_abonosCuentasPorCobrar: number = 0;
  total_abonosCuentasPorCobrar: number = 0;

  cantidad_abonosCuentasPorPagar: number = 0;
  total_abonosCuentasPorPagar: number = 0;

  cantidad_ventasPagadas: number = 0;
  total_ventasPagadas: number = 0;

  cantidad_comprasPagadas: number = 0;
  total_comprasPagadas: number = 0;

  cantidad_ingresosMovimientosContables: number = 0;
  total_ingresosMovimientosContables: string = '$0';

  cantidad_egresosMovimientosContables: number = 0;
  total_egresosMovimientosContables: number = 0;

  cantidad_ivaFacturasVenta: number = 0;
  total_ivaFacturasVenta: number = 0;

  cantidad_ivaFacturasCompra: number = 0;
  total_ivaFacturasCompra: number = 0;

  total_ingresos: number = 0;
  total_egresos: number = 0;
  total_ganancias: number = 0;

  contabilidadPositiva: boolean = false;

  reportes: boolean = false;

  resetForm() {
    this.fechaInicio = this.AppService.getTimeZoneCurrentDate();
    this.fechaFin = this.AppService.getTimeZoneCurrentDate();
    this.tipoOp = 'Dia';

    this.reportes = false;
  }

  resetRangoPersonalizado() {
    this.fechaInicio = this.AppService.getTimeZoneCurrentDate();
    this.fechaFin = this.AppService.getTimeZoneCurrentDate();
  }

  constructor(
    private AppService: AppService,
    private ContableService: ContableService,
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
  }

  reporteContable() {
    if (this.tipoOp === '0') {
      this.toastr.warning('Es necesario especificar el rango', '¡Atención!', { closeButton: true });
      return;
    }

    let data = {
      data: {
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        tipoOp: this.tipoOp,
      }
    };

    this.ContableService.reporteContable(data).subscribe(
      response => {
        this.rango = response.data[0].rango;
        this.opcion = response.data[0].opcion;

        this.cantidad_ventas = response.data[0].cantidad_ventas;
        this.total_ventas = response.data[0].total_ventas;

        this.cantidad_compras = response.data[0].cantidad_compras;
        this.total_compras = response.data[0].total_compras;

        this.cantidad_cuentasPorCobrar = response.data[0].cantidad_cuentasPorCobrar;
        this.total_cuentasPorCobrar = response.data[0].total_cuentasPorCobrar;

        this.cantidad_cuentasPorPagar = response.data[0].cantidad_cuentasPorPagar;
        this.total_cuentasPorPagar = response.data[0].total_cuentasPorPagar;

        this.cantidad_abonosCuentasPorCobrar = response.data[0].cantidad_abonosCuentasPorCobrar;
        this.total_abonosCuentasPorCobrar = response.data[0].total_abonosCuentasPorCobrar;

        this.cantidad_abonosCuentasPorPagar = response.data[0].cantidad_abonosCuentasPorPagar;
        this.total_abonosCuentasPorPagar = response.data[0].total_abonosCuentasPorPagar;

        this.cantidad_ventasPagadas = response.data[0].cantidad_ventasPagadas;
        this.total_ventasPagadas = response.data[0].total_ventasPagadas;

        this.cantidad_comprasPagadas = response.data[0].cantidad_comprasPagadas;
        this.total_comprasPagadas = response.data[0].total_comprasPagadas;

        this.cantidad_ingresosMovimientosContables = response.data[0].cantidad_ingresosMovimientosContables;
        this.total_ingresosMovimientosContables = response.data[0].total_ingresosMovimientosContables;

        this.cantidad_egresosMovimientosContables = response.data[0].cantidad_egresosMovimientosContables;
        this.total_egresosMovimientosContables = response.data[0].total_egresosMovimientosContables;

        this.cantidad_ivaFacturasVenta = response.data[0].cantidad_ivaFacturasVenta;
        this.total_ivaFacturasVenta = response.data[0].total_ivaFacturasVenta;

        this.cantidad_ivaFacturasCompra = response.data[0].cantidad_ivaFacturasCompra;
        this.total_ivaFacturasCompra = response.data[0].total_ivaFacturasCompra;

        this.total_ingresos = response.data[0].total_ingresos;
        this.total_egresos = response.data[0].total_egresos;
        this.total_ganancias = response.data[0].total_ganancias;

        this.contabilidadPositiva = response.data[0].total_ganancias >= 0 ? true : false;

        this.reportes =  true;
      }
    );
  }

  // Imprimir reporte
  public printReporte() {

    const docDefinition: any = {
      pageSize: {
        width: 156,
        height: 'auto'
      },
      pageMargins: [8, 8, 8, 8], // Márgenes personalizados (izquierda, arriba, derecha, abajo)
      content: [
        '***************************',
        { text: `Reporte contable`, style: 'header', alignment: 'center' },
        '------------------------------------------',
        { text: `Rango/Fecha: ${this.rango ? this.rango : this.opcion}`, style: 'dataCliente' },
        '***************************',
        { text: `Ventas`, style: 'titles', alignment: 'center' },
        '------------------------------------------',

        {
          table: {
            widths: ['auto', 'auto', 'auto'],
            body: [
              // Cabecera de la tabla
              [
                { text: 'Item', style: 'tableHeader', alignment: 'left', },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'left', },
                { text: 'Total', style: 'tableHeader', alignment: 'left', }
              ],
              // Contenido
              [
                // Ventas
                { text: 'Ventas', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_ventas, style: 'tableBody', alignment: 'left' },
                { text: this.total_ventas, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Ventas pagadas
                { text: 'Ventas pagadas', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_ventasPagadas, style: 'tableBody', alignment: 'left' },
                { text: this.total_ventasPagadas, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Cuentas por cobrar
                { text: 'Cuentas por cobrar', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_cuentasPorCobrar, style: 'tableBody', alignment: 'left' },
                { text: this.total_cuentasPorCobrar, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Abonos en cuentas por cobrar
                { text: 'Abonos en cuentas por cobrar', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_abonosCuentasPorCobrar, style: 'tableBody', alignment: 'left' },
                { text: this.total_abonosCuentasPorCobrar, style: 'tableBody', alignment: 'left' },
              ]
            ]
          },
          layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
        },

        '***************************',
        { text: `Compras`, style: 'titles', alignment: 'center' },
        '------------------------------------------',

        {
          table: {
            widths: ['auto', 'auto', 'auto'],
            body: [
              // Cabecera de la tabla
              [
                { text: 'Item', style: 'tableHeader', alignment: 'left', },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'left', },
                { text: 'Total', style: 'tableHeader', alignment: 'left', }
              ],
              // Contenido
              [
                // Compras
                { text: 'Compras', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_compras, style: 'tableBody', alignment: 'left' },
                { text: this.total_compras, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Compras pagadas
                { text: 'Compras pagadas', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_comprasPagadas, style: 'tableBody', alignment: 'left' },
                { text: this.total_comprasPagadas, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Cuentas por pagar
                { text: 'Cuentas por pagar', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_cuentasPorPagar, style: 'tableBody', alignment: 'left' },
                { text: this.total_cuentasPorPagar, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Abonos en cuentas por pagar
                { text: 'Abonos en cuentas por pagar', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_abonosCuentasPorPagar, style: 'tableBody', alignment: 'left' },
                { text: this.total_abonosCuentasPorPagar, style: 'tableBody', alignment: 'left' },
              ]
            ]
          },
          layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
        },
        '***************************',
        { text: `Tesorería`, style: 'titles', alignment: 'center' },
        '------------------------------------------',
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              // Cabecera de la tabla
              [
                { text: 'Item', style: 'tableHeader', alignment: 'left', },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'left', },
                { text: 'Total', style: 'tableHeader', alignment: 'left', }
              ],
              // Contenido
              [
                // Ingresos
                { text: 'Ingresos', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_ingresosMovimientosContables, style: 'tableBody', alignment: 'left' },
                { text: this.total_ingresosMovimientosContables, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Egresos
                { text: 'Egresos', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_egresosMovimientosContables, style: 'tableBody', alignment: 'left' },
                { text: this.total_egresosMovimientosContables, style: 'tableBody', alignment: 'left' },
              ]
            ]
          },
          layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
        },
        '***************************',
        { text: `IVA en facturas`, style: 'titles', alignment: 'center' },
        '------------------------------------------',
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              // Cabecera de la tabla
              [
                { text: 'Item', style: 'tableHeader', alignment: 'left', },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'left', },
                { text: 'Total', style: 'tableHeader', alignment: 'left', }
              ],
              // Contenido
              [
                // Ventas
                { text: 'Ventas', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_ivaFacturasVenta, style: 'tableBody', alignment: 'left' },
                { text: this.total_ivaFacturasVenta, style: 'tableBody', alignment: 'left' },
              ],
              [
                // Compras
                { text: 'Compras', style: 'tableBody', alignment: 'left' },
                { text: this.cantidad_ivaFacturasCompra, style: 'tableBody', alignment: 'left' },
                { text: this.total_ivaFacturasCompra, style: 'tableBody', alignment: 'left' },
              ]
            ]
          },
          layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
        },
        '***************************',

        { text: `Ingresos: ${this.total_ingresos}`, style: 'info', alignment: 'right' },
        { text: `Egresos: ${this.total_egresos}`, style: 'info', alignment: 'right' },
        { text: `Ganancias: ${this.total_ganancias}`, style: 'info', alignment: 'right' },
      ],
      styles: {
        header: { fontSize: 12, bold: true },
        titleEmpresa: { fontSize: 10, bold: true },
        titles: { fontSize: 10, bold: true },
        info: { fontSize: 8 },
        dataCliente: { fontSize: 8 },
        totales: { fontSize: 8 },
        tableHeader: { fontSize: 8, bold: true },
        tableTitle: { fontSize: 10, bold: true, margin: [0, 0, 0, 10] },
        tableBody: { fontSize: 7, bold: true }
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }

}
