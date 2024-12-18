import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";
import { Decimal } from 'decimal.js';

import { AppService } from 'src/app/services/app.service';
import { CuentasPorCobrarService } from './services/cuentas-por-cobrar.service';
import { AbonosService } from '../abonos/services/abonos.service';  
import { ProductosService } from '../../gestion/productos/services/productos.service';
import { FacturasService } from '../../tienda/services/facturas.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';

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
    abonos?: any[]
  }
}

@Component({
  selector: 'app-cuentas-por-cobrar',
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.css']
})
export class CuentasPorCobrarComponent implements OnInit {
  @ViewChild('ModalNewAbono') ModalNewAbono?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalAddFormasDePago') ModalAddFormasDePago?: ModalDirective;
  @ViewChild('ModalAddObservacion') ModalAddObservacion?: ModalDirective;
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;

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
  search: string = '';
  cuentasPorCobrarFilter: any[] = [];

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

    this.getProductos();
    this.getTiposIva();
    this.getFormasDePago();
  }

  /**
   * MODALS
   */

  openModalAbonar(data: any) {
    this.dataPrintComprobante = data;
    this.cabFactura_id = data.id;
    this.ModalNewAbono?.show();
  }

  openModalEdit(id: number) {
    this.getFactura(id);
    this.ModalEdit?.show();
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

  getProductos() {
    this.ProductosService.getAll().subscribe(
      response => {
        this.productos = response.data.filter((producto: any) => producto.estado === 'Activo');
        this.productosFilter = this.productos;
      }
    );
  }

  getTiposIva() {
    this.OtherServicesService.getTiposIva().subscribe(
      response => {
        this.tiposIva = response.data.filter((tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  getFormasDePago() {
    this.FacturasServices.getFormasDePago().subscribe(
      response => {
        this.formasDePago = response.data.filter((tipo: any) => tipo.estado === 'Activo');
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
        this.selectedOption = response.data.receptor.nombres;
        this.numIdentificacionSelected = response.data.receptor.numeroIdentificacion;
        this.subtotalConIva = response.data.subtotalConIva;
        this.subtotalSinIva = response.data.subtotalSinIva;
        this.totalDescuento = response.data.totalDescuento;
        this.totalDescuento = response.data.totalDescuento;
        this.subtotal = response.data.subtotal;
        this.subtotal = response.data.subtotal;
        this.totalIva = response.data.totalIva;
        this.totalIva = response.data.totalIva;
        this.total = response.data.total;
        
        this.productosEnFactura = response.data.productos.map((producto: any) => ({
          detFactura_id: producto.id,
          id: producto.productos.id,
          codigo: producto.productos.codigo,
          cantidad: producto.cantidad,
          descripcion: producto.descripcion,
          preciosVenta: [
            {pvp: producto.productos.pvp1},
            {pvp: producto.productos.pvp2},
            {pvp: producto.productos.pvp3},
            {pvp: producto.productos.pvp4},
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
      }
    );
  }

  editFactura(id: number, op: number) {
    if (this.productosEnFactura.length === 0) {
      this.toastr.warning('Tiene que agregar al menos un producto en la lista de venta', '¡Listo!', { closeButton: true });
      return;
    }

    if (op === 2) {
      this.estado = 'Pagada';
    } else {
      this.estado = 'Por cobrar';
    }

    let data: DataStructureFactura = {
      data: {
        cabecera: {
          id: this.cabFactura_id,
          tipoFactura: this.tipoFactura,
          perfil_id: this.perfil_id,
          perfil: this.perfil,
          fechaEmision: this.fechaEmision,
          puntoEmision_id: this.puntoEmision_id,
          facturaComercialNegociable: this.facturaComercialNegociable,
          receptor_id: this.receptor_id,
          receptor: this.selectedOption,
          numeroIdentificacion: this.numIdentificacionSelected,
          subtotalSinIva: this.subtotalSinIva,
          subtotalConIva: this.subtotalConIva,
          totalDescuento: this.totalDescuento,
          subtotal: this.subtotal,
          totalIva: this.totalIva,
          totalServicio: 0,
          total: this.total,
          estado: this.estado
        },
        productos: this.productosEnFactura.map(producto => ({
          producto_id: producto.id,
          cantidad: producto.cantidad,
          descripcion: producto.descripcion,
          precioUnitario: producto.precioUnitario,
          iva: this.tiposIva.find(tipo => tipo.id == producto.iva_id).tipoIva,
          descuento: producto.descuentoCalculado,
          valorTotal: producto.valorTotalProducto,
          valorIce: producto.valorIce
        })),
        formasPago: this.formasPagoEnFactura.length === 1 ? this.formasPagoEnFactura.map((item: any) => ({
          formaPago_id: item.formaPago_id,
          formaPago: item.formaPago,
          valor: this.total,
          plazo: item.plazo,
          tiempo: item.tiempo
        })) : this.formasPagoEnFactura,
        observaciones: this.observacionesEnFactura,
        abonos: this.abonosEnFactura,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };


    if (op === 2) {
      Swal.fire({
        title: '<strong>¿Desea confirmar el pago?</strong>',
        html: `
          <label for="monto">Monto recibido</label>
          <input id="monto" type="number" class="form-control" placeholder="Ingrese el monto recibido" min="0">
          ${this.formasPagoEnFactura.length === 0 ? `
            <label style="margin-top: 15px;">Forma de pago</label>
            <select id="formaPagoSelect" class="form-control" required>
              ${this.formasDePago.map(fp => `<option value="${fp.id}">${fp.formaPago}</option>`).join('')}
            </select>
          ` : ''}
          <label id="cambio" style="margin-top: 15px; font-size: 18px; color: #333;">Cambio: 0.00</label>
        `,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
          const montoInput = <HTMLInputElement>document.getElementById('monto');
          const cambioDiv = document.getElementById('cambio');
          const formaPagoSelect = <HTMLSelectElement>document.getElementById('formaPagoSelect');
          const total = Number(data.data.cabecera.total);
      
          montoInput.value = total.toFixed(2);
      
          montoInput.addEventListener('input', () => {
            const montoRecibido = Number(montoInput.value);
      
            if (montoRecibido < 0) {
              montoInput.value = '0';
            }
      
            const cambio = Math.max(0, montoRecibido - total);
            if (cambioDiv) {
              cambioDiv.innerHTML = `Cambio: ${cambio.toFixed(2)}`;
            }
          });
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const montoRecibido = Number((<HTMLInputElement>document.getElementById('monto')).value);
          const total = data.data.cabecera.total;
          let cambio = 0;
      
          if (montoRecibido >= total) {
            cambio = montoRecibido - total;
          }
      
          const observaciones = [
            {
              nombre: 'Pago',
              descripcion: montoRecibido.toFixed(2)
            }
          ];
      
          if (cambio > 0) {
            observaciones.push({
              nombre: 'Cambio',
              descripcion: cambio.toFixed(2)
            });
          }
      
          if (!data.data.observaciones) {
            data.data.observaciones = [];
          }
          data.data.observaciones.push(...observaciones);

          if (this.formasPagoEnFactura.length === 0) {
            const formaPagoSelect = <HTMLSelectElement>document.getElementById('formaPagoSelect');
            const formaPagoId = Number(formaPagoSelect.value);
            data.data.formasPago = [{
              formaPago_id: formaPagoId,
              valor: this.total,
              tiempo: 'Dia/s',
              plazo: 1
            }];
          }
          this.edit(data);
        }
      });      
    } else {
      this.edit(data);
    }
  }

  edit(data: any) {
    this.FacturasServices.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ModalEdit?.hide();
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
              this.comprobanteEditFactura(data, response.data.cabecera.codigoFactura);
            }
          })
        }
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

  barCode() {
    this.barCodeOption = !this.barCodeOption;
    this.resetBusquedaProducto();
  }

  filterProductos() {
    if (!this.search || this.search.trim() === '') {
      this.productosFilterSelected = [];
      return;
    }

    this.productosFilterSelected = this.productosFilter.filter(producto =>
      producto.codigo.includes(this.search) ||
      producto.descripcion.toLowerCase().includes(this.search.toLowerCase())
    );

    // Si hay solo un producto filtrado, agrégalo automáticamente
    if (this.barCodeOption && this.productosFilterSelected.length === 1) {
      this.selectProducto(this.productosFilterSelected[0]);
      this.resetBusquedaProducto();
    }
  }

  selectProducto(productoSeleccionado: any) {
    const productoExistente = this.productosEnFactura.find(producto => producto.codigo === productoSeleccionado.codigo);

    if (productoExistente) {
      productoExistente.cantidad += 1;
      this.calcularTotalProducto(productoExistente);
    } else {
      const newProducto = {
        detFactura_id: 0,
        id: productoSeleccionado.id,
        codigo: productoSeleccionado.codigo,
        cantidad: 1,
        descripcion: productoSeleccionado.descripcion,
        preciosVenta: [
          {pvp: productoSeleccionado.pvp1},
          {pvp: productoSeleccionado.pvp2},
          {pvp: productoSeleccionado.pvp3},
          {pvp: productoSeleccionado.pvp4},
        ].filter(p => p.pvp > 0),
        precioUnitario: productoSeleccionado.pvp1,
        iva_id: this.facturarConIva ? productoSeleccionado.iva_id : 1,
        iva: productoSeleccionado.iva,
        tipoDescuento: '%',
        descuento: 0,
        descuentoCalculado: 0,
        valorTotal: 0,
        valorTotalProducto: 0,
        valorIce: 0
      };
      this.productosEnFactura.push(newProducto);
      this.calcularTotalProducto(newProducto);
    }
    this.resetBusquedaProducto();
  }

  resetBusquedaProducto() {
    if (this.searchInput) {
      this.search = '';
      this.searchInput.nativeElement.value = '';
    }
    this.productosFilterSelected = [];
  }

  calcularTotalProducto(producto: any) {
    const precio = new Decimal(producto.precioUnitario);
    const cantidad = new Decimal(producto.cantidad) || 0;
    const descuento = new Decimal(producto.descuento) || 0;

    if (precio.isNaN() || cantidad.isNaN() || descuento.isNaN()) {
      return;
    }

    let precioConDescuento: Decimal;

    if (producto.tipoDescuento === '%') {
      // Descuento en porcentaje, se aplica sobre el precio unitario
      precioConDescuento = precio.mul(new Decimal(1).minus(descuento.div(100)));
    } else {
      // Descuento en valor monetario
      precioConDescuento = precio.sub(descuento);
    }

    if (precioConDescuento.lessThan(0)) {
      precioConDescuento = new Decimal(0); // Asegurar que no sea negativo
    }

    const valorTotal = precioConDescuento.mul(cantidad);
    producto.valorTotalProducto = valorTotal.toFixed(2);
    this.updateTotales();  // Actualizamos los totales después de calcular el total del producto
  }

  calcularDescuento(tipoDescuento: string, valorTotalConIva: Decimal, descuento: Decimal): Decimal {
    let descuentoCalculado: Decimal = new Decimal(0);

    if (tipoDescuento == '%') {
      // Descuento en porcentaje sobre el valor total con IVA
      descuentoCalculado = valorTotalConIva.mul(descuento).div(100);
    } else if (tipoDescuento == '$') {
      // Descuento en valor monetario, no puede ser mayor que el valor total con IVA
      descuentoCalculado = descuento;
      if (descuentoCalculado.greaterThan(valorTotalConIva)) {
        descuentoCalculado = valorTotalConIva;
      }
    }
    return descuentoCalculado;
  }

  updateTotales() {
    let subtotalConIva = new Decimal(0); // Subtotal de productos que tienen IVA
    let subtotalSinIva = new Decimal(0); // Subtotal de productos que no tienen IVA
    let totalDescuento = new Decimal(0); // Descuento
    let subtotal = new Decimal(0);       // Subtotal de aplicando descuento
    let totalIva = new Decimal(0);       // IVA
    let totalFinal = new Decimal(0);     // Total, subtotal imcluyendo IVA

    this.productosEnFactura.forEach(producto => {
      // Se obtienen los precios unitarios
      const precioProductoSinIva = new Decimal(
        producto.iva_id == 1 ?
        producto.precioUnitario :
        0
      );
      const precioProductoConIva = new Decimal(
        producto.iva_id == 2 || producto.iva_id == 3 ?
        producto.precioUnitario : 0
      );

      // Se optiene la cantidad y descuento
      const cantidad = new Decimal(producto.cantidad);
      const descuento = new Decimal(producto.descuento);
      
      // Se calcula el precio del producto con la cantidad
      let valorTotalSinIva, valorTotalSinIvaSinDescuento;
      let valorTotalConIva, valorTotalConIvaSinDescuento;

      valorTotalConIva = precioProductoConIva.mul(cantidad);
      valorTotalSinIva = precioProductoSinIva.mul(cantidad);

      valorTotalConIvaSinDescuento = precioProductoConIva.mul(cantidad);
      valorTotalSinIvaSinDescuento = precioProductoSinIva.mul(cantidad);
      
      // Se suma valorTotalConIva y valorTotalSinIva
      let valorTotalConSinIva = new Decimal(0);
      valorTotalConSinIva = valorTotalConSinIva.add(valorTotalConIva);
      valorTotalConSinIva = valorTotalConSinIva.add(valorTotalSinIva);

      // Se optiene el descuento en caso que exista descuento
      const descuentoCalculado = this.calcularDescuento(producto.tipoDescuento, valorTotalConSinIva, descuento);
      producto.descuentoCalculado = descuentoCalculado.toFixed(2);

      // Se calcula el subtotal entre la suma de los productos con y sin IVA, y se le resta el descuento
      subtotal = subtotal.add(valorTotalConSinIva).minus(descuentoCalculado);

      // Se obtiene el valor del IVA calculando el valorTotalConIva menos el descuento
      const ivaSeleccionado = this.tiposIva.find(tipo => tipo.id == producto.iva_id);
      const ivaPorcentaje = new Decimal(ivaSeleccionado.tipoIva.replace('%', ''));
      const valorIva = valorTotalConIva.minus(descuentoCalculado).mul(ivaPorcentaje).div(100);

      // Acumular resultados
      subtotalConIva = subtotalConIva.add(valorTotalConIvaSinDescuento); // Se acumula el subtotal con IVA
      subtotalSinIva = subtotalSinIva.add(valorTotalSinIvaSinDescuento); // Se acumula el subtotal sin IVA
      totalIva = totalIva.add(valorIva);                                 // Se acumula el IVA
      totalDescuento = totalDescuento.add(descuentoCalculado);           // Se acumula el descuento
      totalFinal = new Decimal(subtotal.toNumber()+totalIva.toNumber()); // Se acumula el total sumando el subtotal con el IVA
    });

    // Actualizar los totales en el componente
    this.subtotalConIva = subtotalConIva.toFixed(2);   // Subtotal con IVA
    this.subtotalSinIva = subtotalSinIva.toFixed(2);   // Subtotal sin IVA
    this.totalDescuento = totalDescuento.toFixed(2);   // Descuento
    this.subtotal = subtotal.toFixed(2);               // Subtotal
    this.totalIva = totalIva.toFixed(2);               // IVA
    this.total = totalFinal.toFixed(2);                // Total
  }

  validarInputTipoNumber(producto: any, op: number) {
    if (op === 1) {
      if (producto.cantidad < 1) {
        producto.cantidad = 1;
      }
      this.calcularTotalProducto(producto);
    } else {
      if (producto.descuento < 0) {
        producto.descuento = 0;
      }
      this.calcularTotalProducto(producto);
    }
  }

  deleteProducto(id: number, index: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.FacturasServices.deleteProducto(id).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', {closeButton: true});
            }
          }
        );
        this.productosEnFactura.splice(index, 1);
        this.updateTotales();
      }
    })
  }

  /**
   * Select con buscador
   */

  selectedOption: any = null;
  numIdentificacionSelected: any = null;
  dropdownOpen = false;

  actualizarIvaProductos(): void {
    this.productosEnFactura.forEach(productoFactura => {
      // Busca el producto correspondiente en la lista `productos`
      const productoOriginal = this.productos.find(
        prod => prod.codigo === productoFactura.codigo
      );

      if (productoOriginal) {
        // Toma el IVA del producto original
        productoFactura.iva_id = this.facturarConIva
          ? productoOriginal.iva_id // Aplica el IVA registrado en el producto
          : this.tiposIva[0].id; // Si no se factura con IVA, aplica el primero de la lista tiposIva
      }
    });

    // Recalcular los totales de todos los productos
    this.productosEnFactura.forEach(producto => this.calcularTotalProducto(producto));
  }

}
