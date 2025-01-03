import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";
import { Decimal } from 'decimal.js';

import { AppService } from 'src/app/services/app.service';
import { CuentasPorCobrarService } from '../../contabilidad/cuentas-por-cobrar/services/cuentas-por-cobrar.service';
import { AbonosService } from '../../contabilidad/abonos/services/abonos.service';
import { ProductosService } from '../../gestion/productos/services/productos.service';
import { FacturasService } from '../../tienda/services/facturas.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';
import { OrdenesService } from '../services/ordenes.service';

interface Abono {
  cabFactura_id: number;
  monto: number;
  fecha: string;
  descripcion: string;
}

interface CabeceraFactura {
  id: number;
  tipoFactura: string;
  perfil_id: number;
  perfil: string;
  fechaEmision: string;
  puntoEmision_id: number;
  facturaComercialNegociable: string;
  receptor_id: number;
  receptor: string;
  numeroIdentificacion: string;
  subtotalSinIva: number;
  subtotalConIva: number;
  totalDescuento: number;
  subtotal: number;
  totalIva: number;
  totalServicio: number;
  total: number;
  estado: string;
}

interface DataStructureFactura {
  data: {
    cabecera: CabeceraFactura;
    productos: any[];
    auditoria: any;
    formasPago?: any[];
    observaciones?: any[];
    abonos?: any[];
    ordenTrabajo?: any;
  }
}

@Component({
  selector: 'app-atendidas',
  templateUrl: './atendidas.component.html',
  styleUrls: ['./atendidas.component.css']
})
export class AtendidasComponent implements OnInit {

  @ViewChild('ModalSee') ModalSee?: ModalDirective;

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

  ordenes: any[] = [];
  orden_id: number = 0;
  codigoOrden: string = '';
  fechaOrden: string = '';
  fechaOrdenOriginal: string = '';
  descripcionOrden: string = '';
  estadoOrden: string = '';

  generarTurno: boolean = false;
  turno_id: number = 0;
  fechaTurno: string = '';
  turno: number = 0;

  vehiculo_id: number = 0;
  veh_descripcion: string = '';
  marca: string = '';
  modelo: string = '';
  cilindraje: string = '';
  color: string = '';
  anio: number = 0;
  placa: string = '';

  mantenimientosVehiculoStructure = {
    tipo: '',
    observaciones: ''
  }

  mantenimientoVehiculo: any[] = [];

  codigoFactura: string = '';
  perfil_id: number = 0;
  tipoFactura: string = '';
  fechaEmision: string = this.AppService.getTimeZoneCurrentDate();
  puntoEmision_id: number = 0;
  facturaComercialNegociable: string = 'NO';
  receptor_id: number = 0;
  subtotalSinIva: any = 0.00;
  subtotalConIva: any = 0.00;
  totalDescuento: any = 0.00;
  subtotal: any = 0.00;
  totalIva: any = 0.00;
  total: any = 0.00;
  estado: string = '';

  nombresReceptor: string = '';
  numeroIdentificacionReceptor: string = '';

  perfil: any;
  puntosEmision: any[] = [];

  productos: any[] = [];
  productosFilter: any[] = [];
  productosFilterSelected: any[] = [];

  tiposIva: any[] = [];
  facturarConIva: boolean = true;

  productosEnFactura: {
    detFactura_id: number;
    id: number;
    codigo: any;
    cantidad: number;
    descripcion: string,
    preciosVenta: any,
    precioUnitario: number;
    iva_id: number;
    iva: string;
    tipoDescuento: string;
    descuento: number;
    descuentoCalculado: any;
    valorTotal: number;
    valorTotalProducto: any;
    valorIce: number;
  }[] = [];

  formasDePago: any[] = [];
  formasPagoEnFactura: any[] = [];
  observacionesEnFactura: any[] = [];

  abonosEnFactura: any[] = [];
  abonosStructure = {
    monto: 0,
    descripcion: ''
  };

  barCodeOption: boolean = false;

  //Search
  searchByRange: boolean = false;
  searchCuenta: string = '';
  search: string = '';
  ordenesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newAbono.cabFactura_id = 0;
    this.newAbono.monto = 0;
    this.newAbono.fecha = this.AppService.getTimeZoneCurrentDate();
    this.newAbono.descripcion = '';

    this.cabFactura_id = 0;
  }

  constructor(
    private AppService: AppService,
    private CuentasPorCobrarService: CuentasPorCobrarService,
    private AbonosService: AbonosService,
    private ProductosService: ProductosService,
    private FacturasServices: FacturasService,
    private OtherServicesService: OtherServicesService,
    private OrdenesService: OrdenesService,
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

    this.OrdenesService.getAtendidas().subscribe(
      response => {
        this.ordenes = response.data.sort((a: any, b: any) => b.orden.id - a.orden.id);
        this.ordenesFilter = this.ordenes;
        this.loading = false;
      }
    );
  }

  /**
   * MODALS
   */

  openModaSee(id: number) {
    this.getFactura(id);
    this.ModalSee?.show();
  }

  /**
   * SERVICES
   */

  getOrden(id: number) {
    this.FacturasServices.get(id).subscribe(
      response => {
        this.orden_id = response.data.id;
        this.cabFactura_id = response.data.cabFactura_id;
      }
    );
  }

  getFactura(id: number) {
    this.FacturasServices.get(id).subscribe(
      response => {
        this.cabFactura_id = response.data.id;
        this.codigoFactura = response.data.codigoFactura;
        this.tipoFactura = response.data.tipoFactura;
        this.fechaEmision = response.data.fechaEmision;
        this.facturaComercialNegociable = response.data.facturaComercialNegociable;
        this.perfil_id = response.data.perfil_id;
        this.perfil = response.data.emisor.nombres;
        this.puntoEmision_id = response.data.puntoEmision_id;
        this.receptor_id = response.data.receptor_id;
        this.nombresReceptor = response.data.receptor.nombres;
        this.numeroIdentificacionReceptor = response.data.receptor.numeroIdentificacion;
        this.subtotalConIva = response.data.subtotalConIva;
        this.subtotalSinIva = response.data.subtotalSinIva;
        this.totalDescuento = response.data.totalDescuento;
        this.totalDescuento = response.data.totalDescuento;
        this.subtotal = response.data.subtotal;
        this.subtotal = response.data.subtotal;
        this.totalIva = response.data.totalIva;
        this.totalIva = response.data.totalIva;
        this.total = response.data.total;
        this.estado = response.data.estado;

        this.productosEnFactura = response.data.productos.map((producto: any) => ({
          detFactura_id: producto.id,
          id: producto.productos.id,
          codigo: producto.productos.codigo,
          cantidad: producto.cantidad,
          descripcion: producto.descripcion,
          preciosVenta: [
            { pvp: producto.productos.pvp1 },
            { pvp: producto.productos.pvp2 },
            { pvp: producto.productos.pvp3 },
            { pvp: producto.productos.pvp4 },
          ].filter(p => p.pvp > 0),
          precioUnitario: producto.precioUnitario,
          iva_id: this.tiposIva.find((tipo: any) => tipo.tipoIva === producto.iva)?.id,
          iva: producto.iva,
          tipoDescuento: '$',
          descuento: producto.descuento,
          descuentoCalculado: producto.descuento,
          valorTotal: producto.valorTotal,
          valorTotalProducto: producto.valorTotal,
          valorIce: producto.valorIce
        }));

        this.formasPagoEnFactura = response.data.formasDePago;
        this.observacionesEnFactura = response.data.observaciones;
        this.abonosEnFactura = response.data.abonos;

        this.orden_id = response.data.orden.id;
        this.codigoOrden = response.data.orden.codigoOrden;
        this.fechaOrden = response.data.orden.fecha;
        this.fechaOrdenOriginal = response.data.orden.fecha;
        this.descripcionOrden = response.data.orden.descripcion;
        this.estadoOrden = response.data.orden.estado;

        this.turno_id = response.data.orden.turno.id;
        this.fechaTurno = response.data.orden.turno.fecha;
        this.turno = response.data.orden.turno.turno;

        this.vehiculo_id = response.data.orden.vehiculo.id;
        this.veh_descripcion = response.data.orden.vehiculo.descripcion;
        this.marca = response.data.orden.vehiculo.marca;
        this.modelo = response.data.orden.vehiculo.modelo;
        this.cilindraje = response.data.orden.vehiculo.cilindraje;
        this.color = response.data.orden.vehiculo.color;
        this.anio = response.data.orden.vehiculo.anio;
        this.placa = response.data.orden.vehiculo.placa;

        this.mantenimientoVehiculo = response.data.orden.mantenimientoVehiculo;
      }
    );
  }
  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    this.ordenesFilter = this.ordenes.filter((cuenta: {
      codigoFactura: string,
      fechaEmision: string,
      receptor: { nombres: string, numeroIdentificacion: string },
      orden: { codigoOrden: string, fecha: string }
    }) => {
      let filter = true;
      if (this.searchCuenta) {
        filter = cuenta.codigoFactura?.toLowerCase().includes(this.searchCuenta.toLowerCase()) ||
          cuenta.fechaEmision?.toLowerCase().includes(this.searchCuenta.toLowerCase()) ||
          cuenta.receptor.nombres?.toLowerCase().includes(this.searchCuenta.toLowerCase()) ||
          cuenta.receptor.numeroIdentificacion?.toLowerCase().includes(this.searchCuenta.toLowerCase()) ||
          cuenta.orden.codigoOrden?.toLowerCase().includes(this.searchCuenta.toLowerCase()) ||
          cuenta.orden.fecha?.toLowerCase().includes(this.searchCuenta.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.ordenesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  onCheckboxChange(event: any): void {
    this.searchByRange = event.target.checked;
  }

  addMantenimientoVehiculo() {
    if (!this.mantenimientosVehiculoStructure.tipo || !this.mantenimientosVehiculoStructure.observaciones) {
      this.toastr.warning('Todos los campos son obligatorios para añadir una observación', '¡Atención!', { closeButton: true });
      return;
    }

    this.mantenimientoVehiculo.push({ ...this.mantenimientosVehiculoStructure });
    this.mantenimientosVehiculoStructure = {
      tipo: '',
      observaciones: ''
    };
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
        { text: `Código: ${dataAbono.codigoFactura}`, style: 'info' },
        { text: `Cliente: ${data.receptor.nombres}`, style: 'dataCliente' },
        { text: `RUC/Ced/Pass: ${!data.receptor.numeroIdentificacion ? '9999999999' : data.receptor.numeroIdentificacion}`, style: 'dataCliente' },
        '***************************',
        body,
        '***************************',
        { text: `Subtotal con IVA: ${data.subtotalConIva}`, style: 'totales', alignment: 'right' },
        { text: `Subtotal sin IVA: ${data.subtotalSinIva}`, style: 'totales', alignment: 'right' },
        { text: `Descuento: ${data.totalDescuento}`, style: 'totales', alignment: 'right' },
        { text: `Subtotal: ${data.subtotal}`, style: 'totales', alignment: 'right' },
        { text: `IVA: ${data.totalIva}`, style: 'totales', alignment: 'right' },
        { text: `Total: ${data.total}`, style: 'totales', alignment: 'right' },
        '------------------------------------------',
        {
          text: `Estado: ${estado}`, style: 'info', alignment: 'right'
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

  public comprobanteEditFactura(data: any, codigo: any) {
    const tipoFactura = data.data.cabecera.tipoFactura.toUpperCase();

    const productos = data.data.productos.map((item: any) => [
      { text: item.descripcion, style: 'tableBody', alignment: 'left' },
      { text: item.cantidad, style: 'tableBody', alignment: 'left' },
      { text: `${item.precioUnitario}`, style: 'tableBody', alignment: 'left' },
      { text: `${(item.valorTotal)}`, style: 'tableBody', alignment: 'left' }
    ]);

    const docDefinition: any = {
      pageSize: {
        width: 156,
        height: 'auto'
      },
      pageMargins: [8, 8, 8, 8], // Márgenes personalizados (izquierda, arriba, derecha, abajo)
      content: [
        '***************************',
        { text: `COMPROBANTE DE PAGO`, style: 'header', alignment: 'center' },
        { text: `${data.data.cabecera.perfil}`, style: 'titleEmpresa', alignment: 'center' },
        { text: `${codigo}`, style: 'info', alignment: 'center' },
        '------------------------------------------',
        { text: `Cliente: ${data.data.cabecera.receptor}`, style: 'dataCliente' },
        { text: `RUC/Ced/Pass: ${!data.data.cabecera.numeroIdentificacion ? '9999999999' : data.data.cabecera.numeroIdentificacion}`, style: 'dataCliente' },
        '***************************',
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              // Cabecera de la tabla
              [
                { text: 'Descrip.', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] },
                { text: 'Cant.', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] },
                { text: 'P. unit.', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] },
                { text: 'Valor', style: 'tableHeader', alignment: 'left', margin: [0, 0, 0, 0] }
              ],
              // Contenido de la tabla con los productos
              ...productos
            ]
          },
          layout: 'lightHorizontalLines' // Agregar líneas horizontales ligeras
        },
        '***************************',
        { text: `Subtotal con IVA: ${data.data.cabecera.subtotalConIva}`, style: 'totales', alignment: 'right' },
        { text: `Subtotal sin IVA: ${data.data.cabecera.subtotalSinIva}`, style: 'totales', alignment: 'right' },
        { text: `Descuento: ${data.data.cabecera.totalDescuento}`, style: 'totales', alignment: 'right' },
        { text: `Subtotal: ${data.data.cabecera.subtotal}`, style: 'totales', alignment: 'right' },
        { text: `IVA: ${data.data.cabecera.totalIva}`, style: 'totales', alignment: 'right' },
        { text: `Total: ${data.data.cabecera.total}`, style: 'totales', alignment: 'right' },
        '------------------------------------------',
        {
          text: `Estado: ${data.data.cabecera.estado === 'Por cobrar'
            ? 'Por pagar'
            : data.data.cabecera.estado === 'Pagada'
              ? 'Pagado'
              : data.data.cabecera.estado
            }`,
          style: 'info', alignment: 'right'
        },
        {
          text: data.data.observaciones && data.data.observaciones.find((ob: any) => ob.nombre === 'Pago') && data.data.observaciones.find((ob: any) => ob.nombre === 'Cambio')
            ? `Monto: ${data.data.observaciones.find((ob: any) => ob.nombre === 'Pago').descripcion}`
            : '',
          style: 'info', alignment: 'right'
        },
        {
          text: data.data.observaciones && data.data.observaciones.find((ob: any) => ob.nombre === 'Cambio')
            ? `Cambio: ${data.data.observaciones.find((ob: any) => ob.nombre === 'Cambio').descripcion}`
            : '',
          style: 'info', alignment: 'right'
        },
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
