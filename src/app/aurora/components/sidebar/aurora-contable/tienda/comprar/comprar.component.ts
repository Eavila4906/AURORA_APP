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
import { FacturasService } from '../services/facturas.service';
import { PerfilService } from '../../configuracion/facturacion/perfil/services/perfil.service';
import { PuntosDeEmisionService } from '../../configuracion/facturacion/puntos-de-emision/services/puntos-de-emision.service';
import { ProductosService } from '../../gestion/productos/services/productos.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';
import { ProveedoresService } from '../../gestion/proveedores/services/proveedores.service';

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

interface Proveedor {
  proveedor: string;
  descripcion: string;
  identificacion_id: number;
  numeroIdentificacion: string;
  telefono: string;
  email: string;
  direccion: string;
}

@Component({
  selector: 'app-comprar',
  templateUrl: './comprar.component.html',
  styleUrls: ['./comprar.component.css']
})
export class ComprarComponent implements OnInit {

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
  @ViewChild('ModalNewProveedor') ModalNewProveedor?: ModalDirective;
  @ViewChild('ModalAddFormasDePago') ModalAddFormasDePago?: ModalDirective;
  @ViewChild('ModalAddObservacion') ModalAddObservacion?: ModalDirective;
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  showDataHead: boolean = false;

  perfil_id: number = 0;
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

  proveedores: any[] = [];
  proveedoresFilter: any[] = [];
  proveedoresFilterSelected: any[] = [];

  formasDePago: any[] = [];
  formasDePagoEnFactura: any[] = [];

  tiposIva: any[] = [];

  otrosProductos: boolean = false;

  cantidadOPS: number = 1;
  descripcionOPS: string = '';
  precioUnitarioOPS: number = 0.00;
  ivaOPS: number = 1;

  productosEnFactura: {
    id: number;
    codigo: any;
    cantidad: number;
    descripcion: string,
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

  newProveedor: Proveedor = {
    proveedor: '',
    descripcion: '',
    identificacion_id: 0,
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  tiposIdentificacion: any[] = [];
  tipoIdentificacion: string = '';

  abonosEnFactura: any[] = [];
  abonosStructure = {
    monto: 0,
    descripcion: ''
  };

  observacionesEnFactura: any[] = [];

  formaPagoStructure = {
    formaPago_id: 0,
    formaPago: '',
    valor: 0,
    plazo: 0,
    tiempo: 'Día/s'
  };

  observacionesStructure = {
    nombre: '',
    descripcion: ''
  }

  search: string = '';
  searchProveedores: string = '';

  selectedOption: any = null;
  numIdentificacionSelected: any = null;
  dropdownOpen = false;

  barCodeOption: boolean = false;

  resetForm() {
    this.newProveedor.proveedor = '';
    this.newProveedor.descripcion = '';
    this.newProveedor.identificacion_id = 0;
    this.newProveedor.numeroIdentificacion = '';
    this.newProveedor.telefono = '';
    this.newProveedor.email = '';
    this.newProveedor.direccion = '';
    this.resetFormOPS();
  }

  constructor(
    private AppService: AppService,
    private VenderService: FacturasService,
    private PerfilService: PerfilService,
    private PuntosDeEmisionService: PuntosDeEmisionService,
    private ProductosService: ProductosService,
    private ProveedoresService: ProveedoresService,
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
    this.getProveedores();
    this.getFormasDePago();
    this.getTiposIva();
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
    this.ModalNewProveedor?.show();
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

  getProveedores() {
    this.ProveedoresService.getAll().subscribe(
      response => {
        this.proveedores = response.data.filter((cliente: any) => cliente.estado === 'Activo')
          .map((proveedor: any) => ({
            id: proveedor.id,
            numeroIdentificacion: proveedor.numeroIdentificacion,
            proveedor: proveedor.proveedor,
            descripcion: proveedor.descripcion
          }));
        this.proveedoresFilter = this.proveedores;
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

  getTiposIva() {
    this.OtherServicesService.getTiposIva().subscribe(
      response => {
        this.tiposIva = response.data.filter((tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

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
      this.estado = 'Por pagar';
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
      this.estado = 'Por pagar';
    }

    let data: DataStructureFactura = {
      data: {
        cabecera: {
          tipoFactura: 'Compra',
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
          subtotal: this.subtotal,
          totalIva: this.totalIva,
          totalServicio: 0,
          total: this.total,
          estado: this.estado
        },
        productos: this.productosEnFactura.map(producto => ({
          producto_id: producto.id == 0 ? null : producto.id,
          cantidad: producto.cantidad,
          descripcion: producto.descripcion,
          precioUnitario: producto.precioUnitario,
          iva: this.tiposIva.find(tipo => tipo.id == producto.iva_id).tipoIva,
          descuento: producto.descuentoCalculado,
          valorTotal: producto.valorTotalProducto,
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
              this.comprobante(data, response.data.cabecera.codigoFactura);
            }
          })
        }
      }
    );
  }

  createProveedor() {
    let data = {
      data: {
        proveedor: this.newProveedor.proveedor,
        descripcion: this.newProveedor.descripcion,
        identificacion_id: this.newProveedor.identificacion_id,
        numeroIdentificacion: this.newProveedor.numeroIdentificacion,
        telefono: this.newProveedor.telefono,
        email: this.newProveedor.email,
        direccion: this.newProveedor.direccion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.ProveedoresService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetForm();
          this.ModalNewProveedor?.hide();
        }
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

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
        precioUnitario: productoSeleccionado.precioCompra,
        iva_id: productoSeleccionado.iva_id,
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

  resetFormOPS() {
    this.cantidadOPS = 1;
    this.descripcionOPS = '';
    this.precioUnitarioOPS = 0;
    this.ivaOPS = 1;
  }

  addOtrosProductos() {
    if (!this.cantidadOPS || !this.descripcionOPS || !this.precioUnitarioOPS || !this.ivaOPS) {
      this.toastr.warning('Todos los campos son obligatorios', '¡Atención!', { closeButton: true });
      return;
    }
    const newProducto = {
      id: 0,
      codigo: 'N/A',
      cantidad: this.cantidadOPS,
      descripcion: this.descripcionOPS,
      precioUnitario: this.precioUnitarioOPS,
      iva_id: this.ivaOPS,
      iva: '',
      tipoDescuento: '%',
      descuento: 0,
      descuentoCalculado: 0,
      valorTotal: 0,
      valorTotalProducto: 0,
      valorIce: 0
    };
    this.productosEnFactura.push(newProducto);
    this.calcularTotalProducto(newProducto);
    this.resetFormOPS();
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

  clearOrden() {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea limpiar esta orden?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, limpiar',
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
      plazo: 1,
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
    this.subtotal = 0;
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

  // Método para seleccionar una opción
  selectOption(option: any) {
    this.selectedOption = option.proveedor;
    this.numIdentificacionSelected = option.numeroIdentificacion;
    this.receptor_id = option.id;
    this.dropdownOpen = false;
    this.searchProveedores = '';
    this.proveedoresFilter = this.proveedores;
  }

  // Método para abrir o cerrar el dropdown
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.searchProveedores = '';
      this.proveedoresFilter = this.proveedores;
    }
  }

  searchProveedor() {
    this.proveedoresFilter = this.proveedores.filter((proveedor: { proveedor: string, numeroIdentificacion: string }) => {
      let filter = true;
      if (this.searchProveedores) {
        filter = proveedor.proveedor.toLowerCase().includes(this.searchProveedores.toLowerCase()) ||
          proveedor.numeroIdentificacion?.toLowerCase().includes(this.searchProveedores.toLowerCase());
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
      { text: `${item.valorTotal}`, style: 'tableBody', alignment: 'left' }
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
        { text: `Proveedor: ${data.data.cabecera.receptor}`, style: 'dataProveedor' },
        { text: `RUC/Ced/Pass: ${!data.data.cabecera.numeroIdentificacion ? '0000000009' : data.data.cabecera.numeroIdentificacion}`, style: 'dataProveedor' },
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
        dataProveedor: { fontSize: 8 },
        totales: { fontSize: 8 },
        tableHeader: { fontSize: 8, bold: true },
        tableBody: { fontSize: 7, bold: true }
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }
}
