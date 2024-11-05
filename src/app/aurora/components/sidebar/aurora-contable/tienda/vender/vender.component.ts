import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Decimal } from 'decimal.js';
import * as pdfMake from "pdfmake/build/pdfmake";

import { AppService } from 'src/app/services/app.service';
import { FacturasService } from '../services/facturas.service'; 
import { PerfilService } from '../../configuracion/facturacion/perfil/services/perfil.service';
import { PuntosDeEmisionService } from '../../configuracion/facturacion/puntos-de-emision/services/puntos-de-emision.service';
import { ProductosService } from '../../gestion/productos/services/productos.service';
import { ClientesService } from '../../gestion/clientes/services/clientes.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';
interface CabeceraFactura {
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

interface Cliente {
  nombres: string;
  apellidos: string;
  identificacion_id: number;
  numeroIdentificacion: string;
  telefono: string;
  email: string;
  direccion: string;
}

@Component({
  selector: 'app-vender',
  templateUrl: './vender.component.html',
  styleUrls: ['./vender.component.css']
})
export class VenderComponent implements OnInit {
  canDeactivate(): boolean {
    if (this.productosEnFactura.length > 0) {
      return window.confirm("Tiene cambios sin guardar. ¿Está seguro de que desea navegar fuera de esta página?");
    }
    return true;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: BeforeUnloadEvent): void {
    event.returnValue = true;
  }

  @ViewChild('ModalSaveAndAbonar') ModalSaveAndAbonar?: ModalDirective;
  @ViewChild('ModalNewCliente') ModalNewCliente?: ModalDirective;
  @ViewChild('ModalAddFormasDePago') ModalAddFormasDePago?: ModalDirective;
  @ViewChild('ModalAddObservacion') ModalAddObservacion?: ModalDirective;
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  showDataHead: boolean = false;

  perfil_id: number = 0;
  fechaEmision: string = new Date().toISOString().slice(0, 10);
  puntoEmision_id: number = 0;
  facturaComercialNegociable: string = 'NO';
  receptor_id: number = 0;
  subtotalSinIva: any = 0.00;
  subtotalConIva: any = 0.00;
  totalDescuento: any = 0.00;
  totalIva: any = 0.00;
  total: any = 0.00;
  estado: string = '';

  perfil: any;
  puntosEmision: any[] = [];

  productos: any[] = [];
  productosFilter: any[] = [];
  productosFilterSelected: any[] = [];

  clientes: any[] = [];
  clientesFilter: any[] = [];
  clientesFilterSelected: any[] = [];

  formasDePago: any[] = [];
  formasDePagoEnFactura: any[] = [];

  productosEnFactura: {
    id: number;
    codigo: any;
    cantidad: number;
    descripcion: string,
    precioUnitario: number;
    iva: string;
    descuento: number;
    valorTotal: number;
    valorIce: number;
  }[] = [];

  newCliente: Cliente = {
    nombres: '',
    apellidos: '',
    identificacion_id: 0,
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  tiposIdentificacion: any[] = [];
  tipoIdentificacion: string = '';

  search: string = '';

  resetForm() {
    this.newCliente.nombres = '';
    this.newCliente.apellidos = '';
    this.newCliente.identificacion_id = 0;
    this.newCliente.numeroIdentificacion = '';
    this.newCliente.telefono = '';
    this.newCliente.email = '';
    this.newCliente.direccion = '';
  }

  constructor(
    private AppService: AppService,
    private VenderService: FacturasService,
    private PerfilService: PerfilService,
    private PuntosDeEmisionService: PuntosDeEmisionService,
    private ProductosService: ProductosService,
    private ClientesService: ClientesService,
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

    this.getPerfiles();
    this.getPuntosEmision();
    this.getProductos();
    this.getClientes();
    this.getFormasDePago();
  }

  /**
   * MODALS
   */

  openModalSaveAndAbonar() {
    if (this.receptor_id === 0) {
      this.toastr.warning('Tiene que seleccionar un cliente o consumidor final', '¡Listo!', { closeButton: true });
      return;
    }

    if (this.productosEnFactura.length === 0) {
      this.toastr.warning('Tiene que agregar al menos un producto en la lista de venta', '¡Listo!', { closeButton: true });
      return;
    }

    this.ModalSaveAndAbonar?.show();
  }

  openModalCreateCliente() {
    this.ModalNewCliente?.show();
    this.getTiposIdentificacion();
  }

  openModalAddFormasDePago() {
    if (this.productosEnFactura.length === 0) {
      this.toastr.warning('Tiene que agregar al menos un producto en la lista de venta', '¡Listo!', { closeButton: true });
      return;
    }
    this.ModalAddFormasDePago?.show();
  }

  openModalAddObservacion() {
    if (this.productosEnFactura.length === 0) {
      this.toastr.warning('Tiene que agregar al menos un producto en la lista de venta', '¡Listo!', { closeButton: true });
      return;
    }
    this.ModalAddObservacion?.show();
  }

  /**
   * SERVICES
   */

  getProductos() {
    this.ProductosService.getAll().subscribe(
      response => {
        this.productos = response.data.filter((producto: any) => producto.estado === 'Activo');
        this.productosFilter = this.productos;
      }
    );
  }

  getClientes() {
    this.ClientesService.getAll().subscribe(
      response => {
        this.clientes = response.data.filter((cliente: any) => cliente.estado === 'Activo')
          .map((cliente: any) => ({
            id: cliente.id,
            numeroIdentificacion: cliente.numeroIdentificacion,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            nombresCompletos: `${cliente.nombres} ${cliente.apellidos}`
          }));
        this.clientesFilter = this.clientes;
      }
    );
  }

  getPerfiles() {
    this.PerfilService.get().subscribe(
      response => {
        this.perfil = response.data;
        this.perfil_id = this.perfil.id;
      }
    );
  }

  getPuntosEmision() {
    this.PuntosDeEmisionService.getAll().subscribe(
      response => {
        this.puntosEmision = response.data;
        this.puntoEmision_id = this.puntosEmision[0].id;
      }
    );
  }

  getTiposIdentificacion() {
    this.OtherServicesService.getTiposIdentificacion().subscribe(
      response => {
        this.tiposIdentificacion = response.data.filter((tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  getFormasDePago() {
    this.VenderService.getFormasDePago().subscribe(
      response => {
        this.formasDePago = response.data.filter((tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  abonosEnFactura: any[] = [];
  abonosStructure = {
    monto: 0,
    descripcion: ''
  };

  observacionesEnFactura: any[] = [];

  createFactura(op: number) {
    if (this.receptor_id === 0) {
      this.toastr.warning('Tiene que seleccionar un cliente o consumidor final', '¡Listo!', { closeButton: true });
      return;
    }

    if (this.productosEnFactura.length === 0) {
      this.toastr.warning('Tiene que agregar al menos un producto en la lista de venta', '¡Listo!', { closeButton: true });
      return;
    }

    if (op === 1) {
      this.estado = 'Pagada';
    } else if (op === 2) {
      this.estado = 'Por cobrar';
    } else {
      if (this.abonosStructure.monto != 0) {
        if (this.abonosStructure.monto > this.total) {
          this.toastr.warning('El monto del abono no puede ser superior al total de la factura', '¡Listo!', { closeButton: true });
          return;
        }
        if (this.abonosStructure.monto == this.total) {
          this.toastr.warning('El monto del abono no puede ser igual al total de la factura, para eso se recomienda usar la función de Guardar y pagar', '¡Listo!', { closeButton: true });
          return;
        }
        if (this.abonosStructure.monto < 0) {
          this.toastr.warning('El monto del abono no puede ser un valor negativo', '¡Listo!', { closeButton: true });
          return;
        }
        this.abonosEnFactura.push({ ...this.abonosStructure });
        this.abonosStructure = {
          monto: 0,
          descripcion: '',
        }
        this.ModalSaveAndAbonar?.hide();
      } else {
        this.toastr.warning('El monto del abono no puede ser 0', '¡Listo!', { closeButton: true });
        return;
      }
      this.estado = 'Por cobrar';
    }

    let data: DataStructureFactura = {
      data: {
        cabecera: {
          tipoFactura: 'Venta',
          perfil_id: this.perfil_id,
          perfil: this.perfil.emisor,
          fechaEmision: this.fechaEmision,
          puntoEmision_id: this.puntoEmision_id,
          facturaComercialNegociable: this.facturaComercialNegociable,
          receptor_id: this.receptor_id,
          receptor: this.selectedOption,
          numeroIdentificacion: this.numIdentificacionSelected,
          subtotalSinIva: this.subtotalSinIva,
          subtotalConIva: this.subtotalConIva,
          totalDescuento: this.totalDescuento,
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
          iva: producto.iva,
          descuento: producto.descuento,
          valorTotal: producto.valorTotal,
          valorIce: producto.valorIce
        })),
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    if (this.formasDePagoEnFactura && this.formasDePagoEnFactura.length > 0) {
      data.data.formasPago = this.formasDePagoEnFactura;
    }

    if (this.observacionesEnFactura && this.observacionesEnFactura.length > 0) {
      data.data.observaciones = this.observacionesEnFactura;
    }

    if (this.abonosEnFactura && this.abonosEnFactura.length > 0) {
      data.data.abonos = this.abonosEnFactura;
    }

    this.VenderService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.limpiarOrden();
          Swal.fire({
            icon: 'warning',
            title: '<strong>¿Desea imprimir el comprobante?</strong>',
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText: 'Si, imprimir',
            cancelButtonText: 'No, cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.comprobante(data, response.data.cabecera.id);
            }
          })
        }
      }
        
    );
  }

  createCliente() {
    let data = {
      data: {
        nombres: this.newCliente.nombres,
        apellidos: this.newCliente.apellidos,
        identificacion_id: this.newCliente.identificacion_id,
        numeroIdentificacion: this.newCliente.numeroIdentificacion,
        telefono: this.newCliente.telefono,
        email: this.newCliente.email,
        direccion: this.newCliente.direccion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.ClientesService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetForm();
          this.ModalNewCliente?.hide();
        }
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  barCodeOption: boolean = false;

  barCode() {
    this.barCodeOption = !this.barCodeOption;
    this.resetBusquedaProducto();
  }

  toggleDataHead(): void {
    this.showDataHead = !this.showDataHead;
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
        id: productoSeleccionado.id,
        codigo: productoSeleccionado.codigo,
        cantidad: 1,
        descripcion: productoSeleccionado.descripcion,
        precioUnitario: productoSeleccionado.pvp1,
        iva: productoSeleccionado.iva,
        descuento: 0,
        valorTotal: 0,
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
    const cantidad = new Decimal(producto.cantidad);
    const descuento = new Decimal(producto.descuento);

    if (precio.isNaN() || cantidad.isNaN() || descuento.isNaN()) {
      return;
    }

    let precioConDescuento = precio.sub(descuento);

    if (precioConDescuento.lessThan(0)) {
      precioConDescuento = new Decimal(0);
    }

    const valorTotal = precioConDescuento.mul(cantidad);
    producto.valorTotal = valorTotal.toFixed(2);
    this.updateTotales();
  }

  updateTotales() {
    let subtotalSinIva = new Decimal(0);
    let subtotalConIva = new Decimal(0);
    let totalDescuento = new Decimal(0);
    let totalIva = new Decimal(0);

    this.productosEnFactura.forEach(producto => {
      const valorTotal = new Decimal(producto.valorTotal);
      const iva = new Decimal(producto.iva.replace('%', '')); // Convertir porcentaje a número
      const valorIva = valorTotal.mul(iva).div(100);

      subtotalSinIva = subtotalSinIva.add(valorTotal);
      subtotalConIva = subtotalConIva.add(valorTotal.add(valorIva));
      totalDescuento = totalDescuento.add(new Decimal(producto.descuento));
      totalIva = totalIva.add(valorIva);
    });

    this.subtotalSinIva = subtotalSinIva.toFixed(2);
    this.subtotalConIva = subtotalConIva.toFixed(2);
    this.totalDescuento = totalDescuento.toFixed(2);
    this.totalIva = totalIva.toFixed(2);
    this.total = subtotalConIva.toFixed(2);
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

  clearOrden() {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea limpiar esta orden?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.limpiarOrden();
      }
    });
  }

  limpiarOrden() {
    this.productosEnFactura = [];
    this.formasDePagoEnFactura = [];
    this.formaPagoStructure = {
      formaPago_id: 0,
      formaPago: '',
      valor: 0,
      plazo: 0,
      tiempo: 'Día/s'
    };
    this.observacionesEnFactura = [];
    this.observacionesStructure = {
      nombre: '',
      descripcion: ''
    };
    this.abonosEnFactura = [];
    this.abonosStructure = {
      monto: 0,
      descripcion: ''
    };
    this.subtotalSinIva = 0;
    this.subtotalConIva = 0;
    this.totalDescuento = 0;
    this.totalIva = 0;
    this.total = 0;
    this.search = '';
    this.receptor_id = 0;
    this.selectedOption = null;
  }

  deleteProducto(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosEnFactura.splice(id, 1);
        this.updateTotales();
      }
    })
  }

  formaPagoStructure = {
    formaPago_id: 0,
    formaPago: '',
    valor: 0,
    plazo: 0,
    tiempo: 'Día/s'
  };

  onFormaPagoChange(event: any) {
    const selectedId = event.target.value;
    const selectedFormaPago = this.formasDePago.find(f => f.id == selectedId);

    if (selectedFormaPago) {
      this.formaPagoStructure.formaPago = selectedFormaPago.formaPago;
    }
  }

  addFormaDePago() {
    if (
      !this.formaPagoStructure.formaPago_id || !this.formaPagoStructure.valor ||
      !this.formaPagoStructure.plazo || !this.formaPagoStructure.tiempo
    ) {
      this.toastr.warning('Todos los campos son obligatorios para añadir una forma de pago', '¡Listo!', { closeButton: true });
      return;
    }

    this.formasDePagoEnFactura.push({ ...this.formaPagoStructure });
    this.formaPagoStructure = {
      formaPago_id: 0,
      formaPago: '',
      valor: 0,
      plazo: 0,
      tiempo: 'Día/s'
    };
  }

  deleteFormaDePago(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.formasDePagoEnFactura.splice(id, 1);
      }
    })
  }

  observacionesStructure = {
    nombre: '',
    descripcion: ''
  }

  addObservacion() {
    if (!this.observacionesStructure.nombre || !this.observacionesStructure.descripcion) {
      this.toastr.warning('Todos los campos son obligatorios para añadir una observación', '¡Listo!', { closeButton: true });
      return;
    }

    this.observacionesEnFactura.push({ ...this.observacionesStructure });
    this.observacionesStructure = {
      nombre: '',
      descripcion: ''
    };
  }

  deleteObservacion(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.observacionesEnFactura.splice(id, 1);
      }
    })
  }

  /**
   * Select con buscador
   */

  selectedOption: any = null;
  numIdentificacionSelected: any = null;
  dropdownOpen = false;

  // Método para seleccionar una opción
  selectOption(option: any) {
    this.selectedOption = option.nombresCompletos;
    this.numIdentificacionSelected = option.numeroIdentificacion;
    this.receptor_id = option.id;
    this.dropdownOpen = false;
    this.searchClientes = '';
    this.clientesFilter = this.clientes;
  }

  // Método para abrir o cerrar el dropdown
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.searchClientes = '';
      this.clientesFilter = this.clientes;
    }
  }

  searchClientes: string = '';

  searchCliente() {
    this.clientesFilter = this.clientes.filter((cliente: { nombres: string, apellidos: string, numeroIdentificacion: string }) => {
      let filter = true;
      if (this.searchClientes) {
        filter = cliente.nombres.toLowerCase().includes(this.searchClientes.toLowerCase()) ||
          cliente.apellidos.toLowerCase().includes(this.searchClientes.toLowerCase()) ||
          cliente.numeroIdentificacion.toLowerCase().includes(this.searchClientes.toLowerCase());
      }
      return filter;
    });
  }

  // Imprimir comprobante
  public comprobante(data: any, codigo: any) {
    const tipoFactura = data.data.cabecera.tipoFactura.toUpperCase();

    const productos = data.data.productos.map((item: any) => [
      { text: item.descripcion, style: 'tableBody', alignment: 'left' },
      { text: item.cantidad, style: 'tableBody', alignment: 'left' },
      { text: `${item.precioUnitario}`, style: 'tableBody', alignment: 'left' },
      { text: `${(item.precioUnitario * item.cantidad).toFixed(2)}`, style: 'tableBody', alignment: 'left' }
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
        { text: `${this.AppService.padNumber(codigo)}`, style: 'info', alignment: 'center' },
        '------------------------------------------',
        { text: `Cliente: ${data.data.cabecera.receptor}`, style: 'dataCliente' },
        { text: `RUC/Ced/Pass: ${data.data.cabecera.numeroIdentificacion}`, style: 'dataCliente' },
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
        { text: `Subtotal sin IVA: $${data.data.cabecera.subtotalSinIva}`, style: 'totales', alignment: 'right' },
        { text: `Subtotal con IVA: $${data.data.cabecera.subtotalConIva}`, style: 'totales', alignment: 'right' },
        { text: `Total descuento: $${data.data.cabecera.totalDescuento}`, style: 'totales', alignment: 'right' },
        { text: `Total IVA: $${data.data.cabecera.totalIva}`, style: 'totales', alignment: 'right' },
        { text: `Total: $${data.data.cabecera.total}`, style: 'totales', alignment: 'right' },
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
          text: data.data.abonos 
            ? `Total de abono: $${data.data.abonos[0].monto.toFixed(2)}`
            : '', 
          style: 'info', alignment: 'right'
        },
        {
          text: data.data.abonos
            ? `Total pendiente: $${(data.data.cabecera.total - data.data.abonos[0].monto).toFixed(2)}`
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