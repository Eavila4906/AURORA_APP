import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Decimal } from 'decimal.js';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import { AppService } from 'src/app/services/app.service';
import { FacturasService } from '../../../tienda/services/facturas.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';

interface Emisor {
  nombres: string;
  RUC: string;
  establecimiento: string;
}

interface Receptor {
  nombres: string;
  numeroIdentificacion: string;
  telefono: string;
  email: string;
  direccion: string;
  tipoReceptor: string;
}

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  id: number = 0;
  codigoFactura: string = '';
  tipoFactura: string = '';
  fechaEmision: string = '';
  puntoEmision_id: number = 0;
  facturaComercialNegociable: string = '';
  subTotalSinIva: number = 0;
  subTotalConIva: number = 0;
  totalDescuento: number = 0;
  subtotal: number = 0;
  totalIva: number = 0;
  totalServicio: number = 0;
  total: number = 0;
  estado: string = '';
  puntoEmision: string = '';

  emisor: Emisor = {
    nombres: '',
    RUC: '',
    establecimiento: ''
  };

  receptor: Receptor = {
    nombres: '',
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: '',
    tipoReceptor: ''
  };

  productosEnFactura: any[] = [];
  observacionesEnFactura: any[] = [];
  formasDePagoEnFactura: any[] = [];
  abonosEnFactura: any[] = [];

  facturas: any[] = [];
  facturasFilter: any[] = [];

  //Search
  search: string = '';
  filterTipoFactura: string = 'Venta';
  filterFechaEmision: string = this.AppService.getTimeZoneCurrentDate();
  filterEstado: string = 'Todos';

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  constructor(
    private AppService: AppService,
    private FacturasService: FacturasService,
    private OtherServicesService: OtherServicesService,
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

    this.getFacturas();
  }

  /**
   * MODALS
   */

  openModalSee(id: number) {
    this.getFactura(id);
    this.ModalSee?.show();
  }

  /**
   * SERVICES
   */

  getFacturas() {
    this.FacturasService.getAll().subscribe(
      response => {
        this.facturas = response.data.sort((a: any, b: any) => b.id - a.id);
        this.Search();
        //this.facturasFilter = this.facturas;
        this.loading = false;
      }
    );
  }

  getFactura(id: number) {
    this.FacturasService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.codigoFactura = response.data.codigoFactura;
        this.tipoFactura = response.data.tipoFactura;
        this.fechaEmision = response.data.fechaEmision;
        this.facturaComercialNegociable = response.data.facturaComercialNegociable;
        this.subTotalSinIva = response.data.subtotalSinIva;
        this.subTotalConIva = response.data.subtotalConIva;
        this.totalDescuento = response.data.totalDescuento;
        this.subtotal = response.data.subtotal;
        this.totalIva = response.data.totalIva;
        this.totalServicio = response.data.totalServicio;
        this.total = response.data.total;
        this.estado = response.data.estado;
        this.puntoEmision = response.data.puntoEmision;

        this.emisor = response.data.emisor as Emisor;
        this.receptor = response.data.receptor as Receptor;
        this.formasDePagoEnFactura = response.data.formasDePago;
        this.observacionesEnFactura = response.data.observaciones;
        this.abonosEnFactura = response.data.abonos;
        this.productosEnFactura = response.data.productos;
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    if (
      this.filterTipoFactura === 'Venta' && this.filterEstado === 'Por pagar' ||
      this.filterTipoFactura === 'Compra' && this.filterEstado === 'Por cobrar'
    ) {
      this.filterEstado = 'Todos';
    }

    console.log(this.filterFechaEmision);

    this.facturasFilter = this.facturas.filter((factura) => {
      let matchesTipoFactura = true;
      let matchesFechaEmision = true;
      let matchesEstado = true;
      let matchesGeneral = true;
  
      // Filtro por tipo de factura
      if (this.filterTipoFactura) {
        matchesTipoFactura = factura.tipoFactura
          ?.toLowerCase()
          .includes(this.filterTipoFactura.toLowerCase());
      }

      if (this.filterFechaEmision) {
        matchesFechaEmision = factura.fechaEmision
          ?.toLowerCase()
          .includes(this.filterFechaEmision.toLowerCase());
      }
  
      // Filtro por estado
      if (this.filterEstado && this.filterEstado !== 'Todos') {
        matchesEstado = factura.estado
          ?.toLowerCase()
          .includes(this.filterEstado.toLowerCase());
      }
  
      // Filtro general (búsqueda)
      if (this.search) {
        matchesGeneral =
          factura.codigoFactura?.toLowerCase().includes(this.search.toLowerCase()) ||
          factura.emisor.nombres?.toLowerCase().includes(this.search.toLowerCase()) ||
          factura.receptor.nombres?.toLowerCase().includes(this.search.toLowerCase()) ||
          factura.receptor.numeroIdentificacion?.toLowerCase().includes(this.search.toLowerCase());
      }
  
      // Retorna solo las facturas que cumplen con todos los filtros
      return matchesTipoFactura && matchesFechaEmision && matchesEstado && matchesGeneral;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.facturasFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  printFactura(op: number) {
    const docDefinition: any = {
      content: [
        { text: `Factura de ${this.tipoFactura}`, style: 'header', alignment: 'center' },

        // Información del Emisor y Receptor
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Emisor', style: 'subheader' },
                { text: `${this.emisor.nombres}`, bold: true },
                { text: `RUC: ${this.emisor.RUC}` },
                { text: `Establecimiento: ${this.emisor.establecimiento}` },
                { text: `Punto de Emisión: ${this.puntoEmision}` },
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'Receptor', style: 'subheader' },
                { text: `${this.receptor.nombres}`, bold: true },
                { text: `RUC/Ced/Pass: ${!this.receptor.numeroIdentificacion ? '9999999999' : this.receptor.numeroIdentificacion}` },
                { text: `Teléfono: ${!this.receptor.telefono ? 'N/A' : this.receptor.telefono}` },
                { text: `Email: ${!this.receptor.email ? 'N/A' : this.receptor.email}` },
                { text: `Dirección: ${!this.receptor.direccion ? 'N/A' : this.receptor.direccion}` }
              ]
            }
          ]
        },
        { text: '', margin: [0, 20] },

        // Detalles de la Factura
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Detalles de Factura', style: 'subheader' },
                { text: `Código: ${this.codigoFactura}` },
                { text: `Fecha de Emisión: ${this.fechaEmision}` },
                { text: `Estado: ${this.estado}` },
                { text: `Factura Comercial Negociable: ${this.facturaComercialNegociable}` },
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'Totales', style: 'subheader' },
                { text: `Subtotal con IVA: ${this.subTotalConIva}` },
                { text: `Subtotal sin IVA: ${this.subTotalSinIva}` },
                { text: `Descuento: ${this.totalDescuento}` },
                { text: `Subtotal: ${this.subtotal}` },
                { text: `IVA: ${this.totalIva}` },
                //{ text: `Total Servicio: ${this.totalServicio}` },
                { text: `Total: ${this.total}`, style: 'total' }
              ]
            }
          ]
        },
        { text: '', margin: [0, 20] },

        // Lista de Productos
        { text: 'Productos', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Cantidad', fillColor: '#f8f9fa', bold: true },
                { text: 'Descripción', fillColor: '#f8f9fa', bold: true },
                { text: 'Precio Unitario', fillColor: '#f8f9fa', bold: true },
                { text: 'Descuento', fillColor: '#f8f9fa', bold: true },
                { text: 'IVA', fillColor: '#f8f9fa', bold: true },
                { text: 'Valor Total', fillColor: '#f8f9fa', bold: true }
              ],
              ...this.productosEnFactura.map(producto => ([
                producto.cantidad,
                producto.descripcion,
                `${producto.precioUnitario}`,
                `${producto.descuento}`,
                producto.iva,
                `${producto.valorTotal}`
              ]))
            ]
          }
        },
        { text: '', margin: [0, 20] },

        // Formas de Pago
        { text: 'Formas de Pago', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Forma de Pago', fillColor: '#f8f9fa', bold: true },
                { text: 'Valor', fillColor: '#f8f9fa', bold: true },
                { text: 'Plazo', fillColor: '#f8f9fa', bold: true },
                { text: 'Tiempo', fillColor: '#f8f9fa', bold: true }
              ],
              ...(
                this.formasDePagoEnFactura && this.formasDePagoEnFactura.length > 0
                  ? this.formasDePagoEnFactura.map(pago => ([
                    pago.formaPago,
                    `${pago.valor}`,
                    pago.plazo,
                    pago.tiempo
                  ]))
                  : [['-', '-', '-', '-']]
              )
            ]
          }
        },
        { text: '', margin: [0, 20] },

        // Abonos
        { text: 'Abonos', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Monto', fillColor: '#f8f9fa', bold: true },
                { text: 'Saldo', fillColor: '#f8f9fa', bold: true },
                { text: 'Fecha', fillColor: '#f8f9fa', bold: true },
                { text: 'Descripción', fillColor: '#f8f9fa', bold: true },
                { text: 'Estado', fillColor: '#f8f9fa', bold: true }
              ],
              ...(
                this.abonosEnFactura && this.abonosEnFactura.length > 0
                  ? this.abonosEnFactura.map(abono => ([
                    `${abono.monto}`,
                    `${abono.saldo}`,
                    abono.fecha,
                    abono.descripcion,
                    abono.estado
                  ]))
                  : [['-', '-', '-', '-', '-']]
              )
            ]
          }
        },
        { text: '', margin: [0, 20] },

        // Observaciones
        { text: 'Observaciones', style: 'subheader' },
        this.observacionesEnFactura.length > 0
          ? {
            ul: this.observacionesEnFactura.map(observacion => (
              { text: `${observacion.nombre}: ${observacion.descripcion}` }
            ))
          }
          : { text: 'No hay registros para mostrar' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        total: {
          fontSize: 16,
          bold: true
        }
      }
    };

    if (op === 1) {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake.createPdf(docDefinition).download(`Factura_${this.tipoFactura + '_' + this.id}.pdf`);
    }
  }

}
