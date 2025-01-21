import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import JsBarcode from 'jsbarcode';
import { Decimal } from 'decimal.js';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import { AppService } from 'src/app/services/app.service';
import { ProductosService } from './services/productos.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';
import { CategoriasService } from '../categorias/services/categorias.service';
import { LineasService } from '../lineas/services/lineas.service';
import { MarcasService } from '../marcas/services/marcas.service';
import { ProveedoresService } from '../proveedores/services/proveedores.service';

interface Producto {
  codigo: string;
  categoria_id: number;
  marca_id: number;
  linea_id: number;
  proveedor_id: number;
  descripcion: string;
  precioCompra: number;
  fechaElaboracion: string;
  fechaVencimiento: string;
  lote: string;
  medicion_id: number;
  iva_id: number;
  costoIva0: any;
  costoConIva: any;
  habilitarPvp1: boolean;
  pGananciaPvp1: any;
  gananciaPvp1: any;
  pvp1Iva0: any;
  pvp1: any;
  habilitarPvp2: boolean;
  pGananciaPvp2: any;
  gananciaPvp2: any;
  pvp2Iva0: any;
  pvp2: any;
  habilitarPvp3: boolean;
  pGananciaPvp3: any;
  gananciaPvp3: any;
  pvp3Iva0: any;
  pvp3: any;
  habilitarPvp4: boolean;
  pGananciaPvp4: any;
  gananciaPvp4: any;
  pvp4Iva0: any;
  pvp4: any;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  productos: any[] = [];
  id: number = 0;
  codigo: string = '';
  barCodeImage: string = '';
  barCodeImageNewProducto: string = '';
  barCodeNewProducto: string = '';
  categoria_id: number = 0;
  marca_id: number = 0;
  linea_id: number = 0;
  proveedor_id: number = 0;
  descripcion: string = '';
  precioCompra: number = 0.0;
  fechaElaboracion: string = '';
  fechaVencimiento: string = '';
  lote: string = '';
  medicion_id: number = 0;
  iva_id: number = 0;

  costoIva0: any = 0.00;
  costoConIva: any = 0.00;

  habilitarPvp1: boolean = true;
  pGananciaPvp1: any = 0.00;
  gananciaPvp1: any = 0.00;
  pvp1Iva0: any = 0.00;
  pvp1: any = 0.00;

  habilitarPvp2: boolean = false;
  pGananciaPvp2: any = 0.00;
  gananciaPvp2: any = 0.00;
  pvp2Iva0: any = 0.00;
  pvp2: any = 0.00;

  habilitarPvp3: boolean = false;
  pGananciaPvp3: any = 0.00;
  gananciaPvp3: any = 0.00;
  pvp3Iva0: any = 0.00;
  pvp3: any = 0.00;

  habilitarPvp4: boolean = false;
  pGananciaPvp4: any = 0.00;
  gananciaPvp4: any = 0.00;
  pvp4Iva0: any = 0.00;
  pvp4: any = 0.00;

  estado: string = 'Activo';

  existencia: any;

  marcas: any[] = [];
  marca: string = '';

  lineas: any[] = [];
  linea: string = '';

  proveedores: any[] = [];
  proveedor: string = '';

  categorias: any[] = [];
  categoria: string = '';

  tiposMedicion: any[] = [];
  tipoMedicion: string = '';

  tiposIva: any[] = [];
  tipoIva: string = '';

  newProducto: Producto = {
    codigo: '',
    categoria_id: 0,
    marca_id: 0,
    linea_id: 0,
    proveedor_id: 0,
    descripcion: '',
    precioCompra: 0.0,
    fechaElaboracion: '',
    fechaVencimiento: '',
    lote: '',
    medicion_id: 0,

    iva_id: 0,
    costoIva0: 0.00,
    costoConIva: 0.00,

    habilitarPvp1: true,
    pGananciaPvp1: 0.00,
    gananciaPvp1: 0.00,
    pvp1Iva0: 0.00,
    pvp1: 0.00,

    habilitarPvp2: false,
    pGananciaPvp2: 0.00,
    gananciaPvp2: 0.00,
    pvp2Iva0: 0.00,
    pvp2: 0.00,

    habilitarPvp3: false,
    pGananciaPvp3: 0.00,
    gananciaPvp3: 0.00,
    pvp3Iva0: 0.00,
    pvp3: 0.00,

    habilitarPvp4: false,
    pGananciaPvp4: 0.00,
    gananciaPvp4: 0.00,
    pvp4Iva0: 0.00,
    pvp4: 0.00,
  }

  //Search
  search: string = '';
  productosFilter: any[] = [];
  filterCategoria: any = 'Todas';
  filterMarca: any = 'Todas';
  filterLinea: any = 'Todas';
  filterProveedor: any = 'Todos';
  filterExistencia: any = '';
  filterEstado: any = 'Todos';

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newProducto.codigo = '';
    this.newProducto.categoria_id = 0;
    this.newProducto.marca_id = 0;
    this.newProducto.linea_id = 0;
    this.newProducto.proveedor_id = 0;
    this.newProducto.descripcion = '';
    this.newProducto.precioCompra = 0.0;
    this.newProducto.fechaElaboracion = '';
    this.newProducto.fechaVencimiento = '';
    this.newProducto.lote = '';
    this.newProducto.medicion_id = 0;
    this.newProducto.iva_id = 0;

    this.newProducto.costoIva0 = 0.00,
    this.newProducto.costoConIva = 0.00,

    this.newProducto.habilitarPvp1 = true,
    this.newProducto.pGananciaPvp1 = 0.00,
    this.newProducto.gananciaPvp1 = 0.00,
    this.newProducto.pvp1Iva0 = 0.00,
    this.newProducto.pvp1 = 0.00,

    this.newProducto.habilitarPvp2 = false,
    this.newProducto.pGananciaPvp2 = 0.00,
    this.newProducto.gananciaPvp2 = 0.00,
    this.newProducto.pvp2Iva0 = 0.00,
    this.newProducto.pvp2 = 0.00,

    this.newProducto.habilitarPvp3 = false,
    this.newProducto.pGananciaPvp3 = 0.00,
    this.newProducto.gananciaPvp3 = 0.00,
    this.newProducto.pvp3Iva0 = 0.00,
    this.newProducto.pvp3 = 0.00,

    this.newProducto.habilitarPvp4 = false,
    this.newProducto.pGananciaPvp4 = 0.00,
    this.newProducto.gananciaPvp4 = 0.00,
    this.newProducto.pvp4Iva0 = 0.00,
    this.newProducto.pvp4 = 0.00,

    this.id = 0;
    this.codigo = '';
    this.categoria_id = 0;
    this.marca_id = 0;
    this.linea_id = 0;
    this.proveedor_id = 0;
    this.descripcion = '';
    this.fechaElaboracion = '';
    this.fechaVencimiento = '';
    this.lote = '';
    this.medicion_id = 0;
    this.iva_id = 0;

    this.costoIva0 = 0.00,
    this.costoConIva = 0.00,

    this.habilitarPvp1 = true,
    this.pGananciaPvp1 = 0.00,
    this.gananciaPvp1 = 0.00,
    this.pvp1Iva0 = 0.00,
    this.pvp1 = 0.00,

    this.habilitarPvp2 = false,
    this.pGananciaPvp2 = 0.00,
    this.gananciaPvp2 = 0.00,
    this.pvp2Iva0 = 0.00,
    this.pvp2 = 0.00,

    this.habilitarPvp3 = false,
    this.pGananciaPvp3 = 0.00,
    this.gananciaPvp3 = 0.00,
    this.pvp3Iva0 = 0.00,
    this.pvp3 = 0.00,

    this.habilitarPvp4 = false,
    this.pGananciaPvp4 = 0.00,
    this.gananciaPvp4 = 0.00,
    this.pvp4Iva0 = 0.00,
    this.pvp4 = 0.00,

    this.estado = 'Activo';
  }

  constructor(
    private AppService: AppService,
    private ProductosService: ProductosService,
    private CategoriasService: CategoriasService,
    private MarcasService: MarcasService,
    private LineasService: LineasService,
    private ProveedoresService: ProveedoresService,
    private TiposMedicion: OtherServicesService,
    private TiposIva: OtherServicesService,
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

    this.ProductosService.getAll().subscribe(
      response => {
        this.productos = response.data.sort((a: any, b: any) => b.id - a.id);
        this.productosFilter = this.productos;
        this.loading = false;
      }
    );

    this.getCategorias();
    this.getMarcas();
    this.getLineas();
    this.getProveedores();
    this.getTiposMedicion();
    this.getTiposIva();
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.barCodeGenerateInput();
    this.barCodeImageNewProducto = this.generateBarcodeImage(this.barCodeNewProducto);
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getProducto(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getProducto(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getProducto(id: number) {
    this.ProductosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.codigo = response.data.codigo;
        this.barCodeImage = this.generateBarcodeImage(this.codigo);
        this.categoria_id = response.data.categoria_id;
        this.categoria = response.data.nombreCategoria;
        this.marca_id = response.data.marca_id;
        this.marca = response.data.nombreMarca;
        this.linea_id = response.data.linea_id;
        this.linea = response.data.nombreLinea;
        this.proveedor_id = response.data.proveedor_id;
        this.proveedor = response.data.nombreProveedor;
        this.descripcion = response.data.descripcion;
        this.fechaElaboracion = response.data.fechaElaboracion;
        this.fechaVencimiento = response.data.fechaVencimiento;
        this.lote = response.data.lote;
        this.medicion_id = response.data.medicion_id;
        this.tipoMedicion = response.data.medicion;
        this.iva_id = response.data.iva_id;
        this.tipoIva = response.data.iva;

        this.costoIva0 = response.data.costoIva0;
        this.costoConIva = response.data.costoConIva;

        this.habilitarPvp1 = response.data.habilitarPvp1;
        this.pGananciaPvp1 = response.data.pGananciaPvp1;
        this.gananciaPvp1 = response.data.gananciaPvp1;
        this.pvp1Iva0 = response.data.pvp1Iva0;
        this.pvp1 = response.data.pvp1;

        this.habilitarPvp2 = response.data.habilitarPvp2;
        this.pGananciaPvp2 = response.data.pGananciaPvp2;
        this.gananciaPvp2 = response.data.gananciaPvp2;
        this.pvp2Iva0 = response.data.pvp2Iva0;
        this.pvp2 = response.data.pvp2;

        this.habilitarPvp3 = response.data.habilitarPvp3;
        this.pGananciaPvp3 = response.data.pGananciaPvp3;
        this.gananciaPvp3 = response.data.gananciaPvp3;
        this.pvp3Iva0 = response.data.pvp3Iva0;
        this.pvp3 = response.data.pvp3;

        this.habilitarPvp4 = response.data.habilitarPvp4;
        this.pGananciaPvp4 = response.data.pGananciaPvp4;
        this.gananciaPvp4 = response.data.gananciaPvp4;
        this.pvp4Iva0 = response.data.pvp4Iva0;
        this.pvp4 = response.data.pvp4;

        this.estado = response.data.estado;
        this.existencia = response.data.stock ? response.data.stock.cantidad : 'Ingreso pendiente al invetario.';
      }
    );
  }

  getCategorias() {
    this.CategoriasService.getAll().subscribe(
      response => {
        this.categorias = response.data.filter((categoria: any) => categoria.estado === 'Activo');
      }
    );
  }

  getMarcas() {
    this.MarcasService.getAll().subscribe(
      response => {
        this.marcas = response.data.filter((marca: any) => marca.estado === 'Activo');
      }
    );
  }

  getLineas() {
    this.LineasService.getAll().subscribe(
      response => {
        this.lineas = response.data.filter((linea: any) => linea.estado === 'Activo');
      }
    );
  }

  getProveedores() {
    this.ProveedoresService.getAll().subscribe(
      response => {
        this.proveedores = response.data.filter((proveedor: any) => proveedor.estado === 'Activo');
      }
    );
  }

  getTiposMedicion() {
    this.TiposMedicion.getTiposMedicion().subscribe(
      response => {
        this.tiposMedicion = response.data.filter((tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  getTiposIva() {
    this.TiposIva.getTiposIva().subscribe(
      response => {
        this.tiposIva = response.data.filter((tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  create(op: number) {
    let data = {
      data: {
        codigo: !this.newProducto.codigo && this.barCodeImageNewProducto
          ? this.barCodeNewProducto
          : this.newProducto.codigo,
        categoria_id: this.newProducto.categoria_id,
        marca_id: this.newProducto.marca_id,
        linea_id: this.newProducto.linea_id,
        proveedor_id: this.newProducto.proveedor_id,
        descripcion: this.newProducto.descripcion,
        fechaElaboracion: this.newProducto.fechaElaboracion,
        fechaVencimiento: this.newProducto.fechaVencimiento,
        lote: this.newProducto.lote,
        medicion_id: this.newProducto.medicion_id,
        iva_id: this.newProducto.iva_id,
        costoIva0: this.newProducto.costoIva0,
        costoConIva: this.newProducto.costoConIva,
        habilitarPvp1: this.newProducto.habilitarPvp1,
        pGananciaPvp1: this.newProducto.pGananciaPvp1,
        gananciaPvp1: this.newProducto.gananciaPvp1,
        pvp1Iva0: this.newProducto.pvp1Iva0,
        pvp1: this.newProducto.pvp1,
        habilitarPvp2: this.newProducto.habilitarPvp2,
        pGananciaPvp2: this.newProducto.pGananciaPvp2,
        gananciaPvp2: this.newProducto.gananciaPvp2,
        pvp2Iva0: this.newProducto.pvp2Iva0,
        pvp2: this.newProducto.pvp2,
        habilitarPvp3: this.newProducto.habilitarPvp3,
        pGananciaPvp3: this.newProducto.pGananciaPvp3,
        gananciaPvp3: this.newProducto.gananciaPvp3,
        pvp3Iva0: this.newProducto.pvp3Iva0,
        pvp3: this.newProducto.pvp3,
        habilitarPvp4: this.newProducto.habilitarPvp4,
        pGananciaPvp4: this.newProducto.pGananciaPvp4,
        gananciaPvp4: this.newProducto.gananciaPvp4,
        pvp4Iva0: this.newProducto.pvp4Iva0,
        pvp4: this.newProducto.pvp4,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.ProductosService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetForm();
          if (op === 2) {
            this.ModalNew?.hide();
          } else {
            this.barCodeGenerateInput();
            this.barCodeImageNewProducto = this.generateBarcodeImage(this.barCodeNewProducto);
          }
        }
      }
    );
  }

  edit(id: number) {
    let data = {
      data: {
        id: id,
        codigo: this.codigo,
        categoria_id: this.categoria_id,
        marca_id: this.marca_id,
        linea_id: this.linea_id,
        proveedor_id: this.proveedor_id,
        descripcion: this.descripcion,
        fechaElaboracion: this.fechaElaboracion,
        fechaVencimiento: this.fechaVencimiento,
        lote: this.lote,
        medicion_id: this.medicion_id,
        iva_id: this.iva_id,
        costoIva0: this.costoIva0,
        costoConIva: this.costoConIva,
        habilitarPvp1: this.habilitarPvp1,
        pGananciaPvp1: this.pGananciaPvp1,
        gananciaPvp1: this.gananciaPvp1,
        pvp1Iva0: this.pvp1Iva0,
        pvp1: this.pvp1,
        habilitarPvp2: this.habilitarPvp2,
        pGananciaPvp2: this.pGananciaPvp2,
        gananciaPvp2: this.gananciaPvp2,
        pvp2Iva0: this.pvp2Iva0,
        pvp2: this.pvp2,
        habilitarPvp3: this.habilitarPvp3,
        pGananciaPvp3: this.pGananciaPvp3,
        gananciaPvp3: this.gananciaPvp3,
        pvp3Iva0: this.pvp3Iva0,
        pvp3: this.pvp3,
        habilitarPvp4: this.habilitarPvp4,
        pGananciaPvp4: this.pGananciaPvp4,
        gananciaPvp4: this.gananciaPvp4,
        pvp4Iva0: this.pvp4Iva0,
        pvp4: this.pvp4,
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.ProductosService.edit(data).subscribe(
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
        this.ProductosService.delete(id).subscribe(
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
    this.productosFilter = this.productos.filter((producto) => {
      let matchesCategoria = true;
      let matchesMarca = true;
      let matchesLinea = true;
      let matchesProveedor = true;
      let matchesExistencia = true;
      let matchesEstado = true;
      let matchesGeneral = true;

      if (this.filterCategoria && this.filterCategoria !== 'Todas') {
        matchesCategoria = producto.nombreCategoria
          ?.toLowerCase()
          .includes(this.filterCategoria.toLowerCase());
      }

      if (this.filterMarca && this.filterMarca !== 'Todas') {
        matchesMarca = producto.nombreMarca
          ?.toLowerCase()
          .includes(this.filterMarca.toLowerCase());
      }

      if (this.filterLinea && this.filterLinea !== 'Todas') {
        matchesLinea = producto.nombreLinea
          ?.toLowerCase()
          .includes(this.filterLinea.toLowerCase());
      }

      if (this.filterProveedor && this.filterProveedor !== 'Todos') {
        matchesProveedor = producto.nombreProveedor
          ?.toLowerCase()
          .includes(this.filterProveedor.toLowerCase());
      }

      if (this.filterExistencia) {
        if (producto.stock && producto.stock.cantidad) {
          matchesExistencia = producto.stock.cantidad
            .toString()
            .toLowerCase()
            .includes(this.filterExistencia.toLowerCase());
        } else {
          matchesExistencia = false;
        }
      }

      if (this.filterEstado && this.filterEstado !== 'Todos') {
        matchesEstado = producto.estado
          ?.toLowerCase()
          .includes(this.filterEstado.toLowerCase());
      }

      // Filtro general (búsqueda)
      if (this.search) {
        matchesGeneral =
          producto.codigo?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.descripcion?.toLowerCase().includes(this.search.toLowerCase());
      }

      return matchesCategoria && matchesMarca && matchesLinea && matchesProveedor && matchesExistencia && matchesEstado && matchesGeneral;
    });
  }

  clearFilters() {
    this.search = '';
    this.filterCategoria = 'Todas';
    this.filterMarca = 'Todas';
    this.filterLinea = 'Todas';
    this.filterProveedor = 'Todos';
    this.filterExistencia = '';
    this.filterEstado = 'Todos';

    this.Search();
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.productosFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  generateBarCode() {
    Swal.fire({
      title: '<strong>¿Cuántos códigos de barras deseas generar?</strong>',
      html: `
        <input type="number" id="input-number" class="form-control" placeholder="Cantidad de códigos">
        <div class="mt-4" style="display: flex; align-items: center; justify-content: start; width: 100%;">
          <label for="existing-code-checkbox">
            <input type="checkbox" id="existing-code-checkbox" style="margin-right: 5px;">
            Ya tengo un código de barras
          </label>
        </div>
        <input type="text" id="existing-code-input" class="form-control" placeholder="Ingrese código existente" 
          style="display: none; align-items: center; justify-content: start;">
      `,
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const checkbox = document.getElementById('existing-code-checkbox') as HTMLInputElement;
        const existingCodeInput = document.getElementById('existing-code-input') as HTMLInputElement;

        // Mostrar/ocultar el campo para el código existente al marcar el checkbox
        checkbox.addEventListener('change', (event) => {
          existingCodeInput.style.display = checkbox.checked ? 'block' : 'none';
        });
      },
      preConfirm: () => {
        const inputValue = (document.getElementById('input-number') as HTMLInputElement).value;
        const existingCodeChecked = (document.getElementById('existing-code-checkbox') as HTMLInputElement).checked;
        const existingCodeValue = (document.getElementById('existing-code-input') as HTMLInputElement).value;

        // Validaciones de entrada
        if (!inputValue || isNaN(Number(inputValue)) || Number(inputValue) <= 0) {
          Swal.showValidationMessage('Debe ingresar un número mayor que 0');
          return;
        }
        if (existingCodeChecked && !existingCodeValue) {
          Swal.showValidationMessage('Debe ingresar el código de barras existente');
          return;
        }

        return { quantity: Number(inputValue), useExistingCode: existingCodeChecked, existingCode: existingCodeValue };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { quantity, useExistingCode, existingCode } = result.value;

        const barcodesData = [];
        for (let i = 0; i < quantity; i++) {
          const barcodeCode = useExistingCode ? existingCode : this.generateUniqueRandomCode();
          const barcodeBase64 = this.generateBarcodeImage(barcodeCode);

          // Añadir a la lista de datos del PDF
          barcodesData.push({ image: barcodeBase64, width: 140, height: 50, margin: [0, 10, 0, 0] });
        }

        // Crear documento PDF y mostrar para imprimir
        const docDefinition: any = {
          pageSize: { width: 156, height: 'auto' },
          pageMargins: [8, 8, 8, 8],
          content: barcodesData
        };

        pdfMake.createPdf(docDefinition).print();
      }
    });
  }

  printBarCode(barcode: string) {
    Swal.fire({
      title: '<strong>¿Cuántos códigos de barras de este producto deseas imprimir?</strong>',
      html: `
        <input type="number" id="input-number" class="form-control" placeholder="Cantidad de códigos">
      `,
      showCancelButton: true,
      confirmButtonText: 'Imprimir',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const inputValue = (document.getElementById('input-number') as HTMLInputElement).value;

        // Validaciones de entrada
        if (!inputValue || isNaN(Number(inputValue)) || Number(inputValue) <= 0) {
          Swal.showValidationMessage('Debe ingresar un número mayor que 0');
          return;
        }

        return { quantity: Number(inputValue) };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { quantity } = result.value;

        const barcodesData = [];
        for (let i = 0; i < quantity; i++) {
          const barcodeBase64 = this.generateBarcodeImage(barcode);

          // Añadir a la lista de datos del PDF
          barcodesData.push({ image: barcodeBase64, width: 140, height: 50, margin: [0, 10, 0, 0] });
        }

        // Crear documento PDF y mostrar para imprimir
        const docDefinition: any = {
          pageSize: { width: 156, height: 'auto' },
          pageMargins: [8, 8, 8, 8],
          content: barcodesData
        };

        pdfMake.createPdf(docDefinition).print();
      }
    });
  }

  generateUniqueRandomCode(): string {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  generateBarcodeImage(code: string): string {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, { format: 'CODE128', lineColor: '#000', width: 2, height: 50, displayValue: true });
    return canvas.toDataURL('image/png');
  }

  barCodeGenerateInput() {
    this.newProducto.codigo = '';
    this.barCodeNewProducto = this.generateUniqueRandomCode();
    this.barCodeImageNewProducto = this.generateBarcodeImage(this.barCodeNewProducto);
  }

  resetBarCodeInput() {
    this.newProducto.codigo = '';
    this.barCodeNewProducto = '';
    this.barCodeImageNewProducto = '';
  }

  // Calculo de costo, ganancia y pvps tomando en cuenta el porcentaje del iva
  calcularCostosAndPvps(form: any, op: any, pvp: any) {
    if (form === 'NEW') {
      const ivaString = this.tiposIva.find(tipo => tipo.id == this.newProducto.iva_id)?.tipoIva.replace('%', '') || '0';
      const iva = new Decimal(ivaString);

      const costoIva0 = new Decimal(this.newProducto.costoIva0 || 0);
      const costoIva = new Decimal(costoIva0.mul(iva).div(100)).toFixed(2);
      const costoConIva = costoIva0.plus(costoIva);
      this.newProducto.costoConIva = costoConIva.toFixed(2);

      const pGananciaPvp1 = new Decimal(this.newProducto.pGananciaPvp1 || 0);
      const pvp1Iva0 = new Decimal(this.newProducto.pvp1Iva0 || 0);

      const pGananciaPvp2 = new Decimal(this.newProducto.pGananciaPvp2 || 0);
      const pvp2Iva0 = new Decimal(this.newProducto.pvp2Iva0 || 0);

      const pGananciaPvp3 = new Decimal(this.newProducto.pGananciaPvp3 || 0);
      const pvp3Iva0 = new Decimal(this.newProducto.pvp3Iva0 || 0);

      const pGananciaPvp4 = new Decimal(this.newProducto.pGananciaPvp4 || 0);
      const pvp4Iva0 = new Decimal(this.newProducto.pvp4Iva0 || 0);

      if (op === 'COSTO' || op === 'GENERAL') {
        this.newProducto.pGananciaPvp1 = '0';
        this.newProducto.gananciaPvp1 = '0.00';
        this.newProducto.pvp1Iva0 = costoConIva.toFixed(2);
        const pvp1Iva = costoConIva.mul(iva).div(100).toFixed(2);
        this.newProducto.pvp1 = costoConIva.plus(pvp1Iva).toFixed(2);

        this.newProducto.pGananciaPvp2 = '0';
        this.newProducto.gananciaPvp2 = '0.00';
        if (this.newProducto.habilitarPvp2) {
          this.newProducto.pvp2Iva0 = costoConIva.toFixed(2);
          const pvp2Iva = costoConIva.mul(iva).div(100).toFixed(2);
          this.newProducto.pvp2 = costoConIva.plus(pvp2Iva).toFixed(2);
        } else {
          this.newProducto.pvp2Iva0 = '0.00';
          this.newProducto.pvp2 = '0.00';
        }

        this.newProducto.pGananciaPvp3 = '0';
        this.newProducto.gananciaPvp3 = '0.00';
        if (this.newProducto.habilitarPvp3) {
          this.newProducto.pvp3Iva0 = costoConIva.toFixed(2);
          const pvp3Iva = costoConIva.mul(iva).div(100).toFixed(2);
          this.newProducto.pvp3 = costoConIva.plus(pvp3Iva).toFixed(2);
        } else {
          this.newProducto.pvp3Iva0 = '0.00';
          this.newProducto.pvp3 = '0.00';
        }

        this.newProducto.pGananciaPvp4 = '0';
        this.newProducto.gananciaPvp4 = '0.00';
        if (this.newProducto.habilitarPvp4) {
          this.newProducto.pvp4Iva0 = costoConIva.toFixed(2);
          const pvp4Iva = costoConIva.mul(iva).div(100).toFixed(2);
          this.newProducto.pvp4 = costoConIva.plus(pvp4Iva).toFixed(2);
        } else {
          this.newProducto.pvp4Iva0 = '0.00';
          this.newProducto.pvp4 = '0.00';
        }

        if (costoIva0.isZero()) {
          if (pvp1Iva0.lte(0)) {
            this.newProducto.pGananciaPvp1 = this.newProducto.habilitarPvp1 ? '100' : '0';
            this.newProducto.gananciaPvp1 = '0.00';
            this.newProducto.pvp1Iva0 = '0.00';
            this.newProducto.pvp1 = '0.00';
          }
          if (pvp2Iva0.lte(0)) {
            this.newProducto.pGananciaPvp2 = this.newProducto.habilitarPvp2 ? '100' : '0';
            this.newProducto.gananciaPvp2 = '0.00';
            this.newProducto.pvp2Iva0 = '0.00';
            this.newProducto.pvp2 = '0.00';
          }
          if (pvp3Iva0.lte(0)) {
            this.newProducto.pGananciaPvp3 = this.newProducto.habilitarPvp3 ? '100' : '0';;
            this.newProducto.gananciaPvp3 = '0.00';
            this.newProducto.pvp3Iva0 = '0.00';
            this.newProducto.pvp3 = '0.00';
          }
          if (pvp4Iva0.lte(0)) {
            this.newProducto.pGananciaPvp4 = this.newProducto.habilitarPvp4 ? '100' : '0';;
            this.newProducto.gananciaPvp4 = '0.00';
            this.newProducto.pvp4Iva0 = '0.00';
            this.newProducto.pvp4 = '0.00';
          }
        }
        return;
      }

      if (pvp === 1) {
        if (op === 'PGANANCIAPVP1') {
          const gananciaPvp1 = costoConIva.mul(pGananciaPvp1).div(100);
          const nuevoPvp1Iva0 = gananciaPvp1.plus(costoConIva);
          const nuevoPvp1Iva = nuevoPvp1Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp1 = nuevoPvp1Iva0.plus(nuevoPvp1Iva);

          this.newProducto.gananciaPvp1 = gananciaPvp1.toFixed(2);
          this.newProducto.pvp1Iva0 = nuevoPvp1Iva0.toFixed(2);
          this.newProducto.pvp1 = nuevoPvp1.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP1') {
          const gananciaPvp1 = new Decimal(this.newProducto.gananciaPvp1 || 0);
          const nuevoPvp1Iva0 = gananciaPvp1.plus(costoConIva);
          const nuevoPvp1Iva = nuevoPvp1Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp1 = nuevoPvp1Iva0.plus(nuevoPvp1Iva);
          const nuevoPorcentajeGanancia = gananciaPvp1.mul(100).div(costoConIva);
          

          this.newProducto.pGananciaPvp1 = nuevoPorcentajeGanancia.toFixed(0);
          this.newProducto.pvp1Iva0 = nuevoPvp1Iva0.toFixed(2);
          this.newProducto.pvp1 = nuevoPvp1.toFixed(2);
          return;
        }

        if (op === 'PVP1') {
          const nuevoPvp1Iva = pvp1Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp1 = pvp1Iva0.plus(nuevoPvp1Iva);

          this.newProducto.pvp1 = nuevoPvp1.toFixed(2);

          const gananciaPvp1 = pvp1Iva0.minus(costoConIva);
          this.newProducto.gananciaPvp1 = gananciaPvp1.toFixed(2);
          this.newProducto.pGananciaPvp1 = gananciaPvp1.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.newProducto.pvp1Iva0 = pvp1Iva0.toFixed(2);
            const nuevoPvp1Iva = pvp1Iva0.mul(iva).div(100).toFixed(2);
            this.newProducto.pvp1 = pvp1Iva0.plus(nuevoPvp1Iva).toFixed(2);
            this.newProducto.pGananciaPvp1 = '100';
            this.newProducto.gananciaPvp1 = pvp1Iva0.toFixed(2);
          }
          return;
        }
      }

      if (pvp === 2) {
        if (op === 'PGANANCIAPVP2') {
          const gananciaPvp2 = costoConIva.mul(pGananciaPvp2).div(100);
          const nuevoPvp2Iva0 = gananciaPvp2.plus(costoConIva);
          const nuevoPvp2Iva = nuevoPvp2Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp2 = nuevoPvp2Iva0.plus(nuevoPvp2Iva);

          this.newProducto.gananciaPvp2 = gananciaPvp2.toFixed(2);
          this.newProducto.pvp2Iva0 = nuevoPvp2Iva0.toFixed(2);
          this.newProducto.pvp2 = nuevoPvp2.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP2') {
          const gananciaPvp2 = new Decimal(this.newProducto.gananciaPvp2 || 0);
          const nuevoPvp2Iva0 = gananciaPvp2.plus(costoConIva);
          const nuevoPvp2Iva = nuevoPvp2Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp2 = nuevoPvp2Iva0.plus(nuevoPvp2Iva);
          const nuevoPorcentajeGanancia = gananciaPvp2.mul(100).div(costoConIva);
          

          this.newProducto.pGananciaPvp2 = nuevoPorcentajeGanancia.toFixed(0);
          this.newProducto.pvp2Iva0 = nuevoPvp2Iva0.toFixed(2);
          this.newProducto.pvp2 = nuevoPvp2.toFixed(2);
          return;
        }

        if (op === 'PVP2') {
          const nuevoPvp2Iva = pvp2Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp2 = pvp2Iva0.plus(nuevoPvp2Iva);

          this.newProducto.pvp2 = nuevoPvp2.toFixed(2);

          const gananciaPvp2 = pvp2Iva0.minus(costoConIva);
          this.newProducto.gananciaPvp2 = gananciaPvp2.toFixed(2);
          this.newProducto.pGananciaPvp2 = gananciaPvp2.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.newProducto.pvp2Iva0 = pvp2Iva0.toFixed(2);
            const nuevoPvp2Iva = pvp2Iva0.mul(iva).div(100).toFixed(2);
            this.newProducto.pvp2 = pvp2Iva0.plus(nuevoPvp2Iva).toFixed(2);
            this.newProducto.pGananciaPvp2 = '100';
            this.newProducto.gananciaPvp2 = pvp2Iva0.toFixed(2);
          }
          return;
        }
      }

      if (pvp === 3) {
        if (op === 'PGANANCIAPVP3') {
          const gananciaPvp3 = costoConIva.mul(pGananciaPvp3).div(100);
          const nuevoPvp3Iva0 = gananciaPvp3.plus(costoConIva);
          const nuevoPvp3Iva = nuevoPvp3Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp3 = nuevoPvp3Iva0.plus(nuevoPvp3Iva);

          this.newProducto.gananciaPvp3 = gananciaPvp3.toFixed(2);
          this.newProducto.pvp3Iva0 = nuevoPvp3Iva0.toFixed(2);
          this.newProducto.pvp3 = nuevoPvp3.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP3') {
          const gananciaPvp3 = new Decimal(this.newProducto.gananciaPvp3 || 0);
          const nuevoPvp3Iva0 = gananciaPvp3.plus(costoConIva);
          const nuevoPvp3Iva = nuevoPvp3Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp3 = nuevoPvp3Iva0.plus(nuevoPvp3Iva);
          const nuevoPorcentajeGanancia = gananciaPvp3.mul(100).div(costoConIva);
          

          this.newProducto.pGananciaPvp3 = nuevoPorcentajeGanancia.toFixed(0);
          this.newProducto.pvp3Iva0 = nuevoPvp3Iva0.toFixed(2);
          this.newProducto.pvp3 = nuevoPvp3.toFixed(2);
          return;
        }

        if (op === 'PVP3') {
          const nuevoPvp3Iva = pvp3Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp3 = pvp3Iva0.plus(nuevoPvp3Iva);

          this.newProducto.pvp3 = nuevoPvp3.toFixed(2);

          const gananciaPvp3 = pvp3Iva0.minus(costoConIva);
          this.newProducto.gananciaPvp3 = gananciaPvp3.toFixed(2);
          this.newProducto.pGananciaPvp3 = gananciaPvp3.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.newProducto.pvp3Iva0 = pvp3Iva0.toFixed(2);
            const nuevoPvp3Iva = pvp3Iva0.mul(iva).div(100).toFixed(2);
            this.newProducto.pvp3 = pvp3Iva0.plus(nuevoPvp3Iva).toFixed(2);
            this.newProducto.pGananciaPvp3 = '100';
            this.newProducto.gananciaPvp3 = pvp3Iva0.toFixed(2);
          }
          return;
        }
      }

      if (pvp === 4) {
        if (op === 'PGANANCIAPVP4') {
          const gananciaPvp4 = costoConIva.mul(pGananciaPvp4).div(100);
          const nuevoPvp4Iva0 = gananciaPvp4.plus(costoConIva);
          const nuevoPvp4Iva = nuevoPvp4Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp4 = nuevoPvp4Iva0.plus(nuevoPvp4Iva);

          this.newProducto.gananciaPvp4 = gananciaPvp4.toFixed(2);
          this.newProducto.pvp4Iva0 = nuevoPvp4Iva0.toFixed(2);
          this.newProducto.pvp4 = nuevoPvp4.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP4') {
          const gananciaPvp4 = new Decimal(this.newProducto.gananciaPvp4 || 0);
          const nuevoPvp4Iva0 = gananciaPvp4.plus(costoConIva);
          const nuevoPvp4Iva = nuevoPvp4Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp4 = nuevoPvp4Iva0.plus(nuevoPvp4Iva);
          const nuevoPorcentajeGanancia = gananciaPvp4.mul(100).div(costoConIva);
          

          this.newProducto.pGananciaPvp4 = nuevoPorcentajeGanancia.toFixed(0);
          this.newProducto.pvp4Iva0 = nuevoPvp4Iva0.toFixed(2);
          this.newProducto.pvp4 = nuevoPvp4.toFixed(2);
          return;
        }

        if (op === 'PVP4') {
          const nuevoPvp4Iva = pvp4Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp4 = pvp4Iva0.plus(nuevoPvp4Iva);

          this.newProducto.pvp4 = nuevoPvp4.toFixed(2);

          const gananciaPvp4 = pvp4Iva0.minus(costoConIva);
          this.newProducto.gananciaPvp4 = gananciaPvp4.toFixed(2);
          this.newProducto.pGananciaPvp4 = gananciaPvp4.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.newProducto.pvp4Iva0 = pvp4Iva0.toFixed(2);
            const nuevoPvp4Iva = pvp4Iva0.mul(iva).div(100).toFixed(2);
            this.newProducto.pvp4 = pvp4Iva0.plus(nuevoPvp4Iva).toFixed(2);
            this.newProducto.pGananciaPvp4 = '100';
            this.newProducto.gananciaPvp4 = pvp4Iva0.toFixed(2);
          }
          return;
        }
      }
    } else {
      const ivaString = this.tiposIva.find(tipo => tipo.id == this.iva_id)?.tipoIva.replace('%', '') || '0';
      const iva = new Decimal(ivaString);

      const costoIva0 = new Decimal(this.costoIva0 || 0);
      const costoIva = new Decimal(costoIva0.mul(iva).div(100)).toFixed(2);
      const costoConIva = costoIva0.plus(costoIva);
      this.costoConIva = costoConIva.toFixed(2);

      const pGananciaPvp1 = new Decimal(this.pGananciaPvp1 || 0);
      const pvp1Iva0 = new Decimal(this.pvp1Iva0 || 0);

      const pGananciaPvp2 = new Decimal(this.pGananciaPvp2 || 0);
      const pvp2Iva0 = new Decimal(this.pvp2Iva0 || 0);

      const pGananciaPvp3 = new Decimal(this.pGananciaPvp3 || 0);
      const pvp3Iva0 = new Decimal(this.pvp3Iva0 || 0);

      const pGananciaPvp4 = new Decimal(this.pGananciaPvp4 || 0);
      const pvp4Iva0 = new Decimal(this.pvp4Iva0 || 0);

      if (op === 'COSTO' || op === 'GENERAL') {
        this.pGananciaPvp1 = '0';
        this.gananciaPvp1 = '0.00';
        this.pvp1Iva0 = costoConIva.toFixed(2);
        const pvp1Iva = costoConIva.mul(iva).div(100).toFixed(2);
        this.pvp1 = costoConIva.plus(pvp1Iva).toFixed(2);

        this.pGananciaPvp2 = '0';
        this.gananciaPvp2 = '0.00';
        if (this.habilitarPvp2) {
          this.pvp2Iva0 = costoConIva.toFixed(2);
          const pvp2Iva = costoConIva.mul(iva).div(100).toFixed(2);
          this.pvp2 = costoConIva.plus(pvp2Iva).toFixed(2);
        } else {
          this.pvp2Iva0 = '0.00';
          this.pvp2 = '0.00';
        }

        this.pGananciaPvp3 = '0';
        this.gananciaPvp3 = '0.00';
        if (this.habilitarPvp3) {
          this.pvp3Iva0 = costoConIva.toFixed(2);
          const pvp3Iva = costoConIva.mul(iva).div(100).toFixed(2);
          this.pvp3 = costoConIva.plus(pvp3Iva).toFixed(2);
        } else {
          this.pvp3Iva0 = '0.00';
          this.pvp3 = '0.00';
        }

        this.pGananciaPvp4 = '0';
        this.gananciaPvp4 = '0.00';
        if (this.habilitarPvp4) {
          this.pvp4Iva0 = costoConIva.toFixed(2);
          const pvp4Iva = costoConIva.mul(iva).div(100).toFixed(2);
          this.pvp4 = costoConIva.plus(pvp4Iva).toFixed(2);
        } else {
          this.pvp4Iva0 = '0.00';
          this.pvp4 = '0.00';
        }

        if (costoIva0.isZero()) {
          if (pvp1Iva0.lte(0)) {
            this.pGananciaPvp1 = this.habilitarPvp1 ? '100' : '0';
            this.gananciaPvp1 = '0.00';
            this.pvp1Iva0 = '0.00';
            this.pvp1 = '0.00';
          }
          if (pvp2Iva0.lte(0)) {
            this.pGananciaPvp2 = this.habilitarPvp2 ? '100' : '0';
            this.gananciaPvp2 = '0.00';
            this.pvp2Iva0 = '0.00';
            this.pvp2 = '0.00';
          }
          if (pvp3Iva0.lte(0)) {
            this.pGananciaPvp3 = this.habilitarPvp3 ? '100' : '0';;
            this.gananciaPvp3 = '0.00';
            this.pvp3Iva0 = '0.00';
            this.pvp3 = '0.00';
          }
          if (pvp4Iva0.lte(0)) {
            this.pGananciaPvp4 = this.habilitarPvp4 ? '100' : '0';;
            this.gananciaPvp4 = '0.00';
            this.pvp4Iva0 = '0.00';
            this.pvp4 = '0.00';
          }
        }
        return;
      }

      if (pvp === 1) {
        if (op === 'PGANANCIAPVP1') {
          const gananciaPvp1 = costoConIva.mul(pGananciaPvp1).div(100);
          const nuevoPvp1Iva0 = gananciaPvp1.plus(costoConIva);
          const nuevoPvp1Iva = nuevoPvp1Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp1 = nuevoPvp1Iva0.plus(nuevoPvp1Iva);

          this.gananciaPvp1 = gananciaPvp1.toFixed(2);
          this.pvp1Iva0 = nuevoPvp1Iva0.toFixed(2);
          this.pvp1 = nuevoPvp1.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP1') {
          const gananciaPvp1 = new Decimal(this.gananciaPvp1 || 0);
          const nuevoPvp1Iva0 = gananciaPvp1.plus(costoConIva);
          const nuevoPvp1Iva = nuevoPvp1Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp1 = nuevoPvp1Iva0.plus(nuevoPvp1Iva);
          const nuevoPorcentajeGanancia = gananciaPvp1.mul(100).div(costoConIva);
          

          this.pGananciaPvp1 = nuevoPorcentajeGanancia.toFixed(0);
          this.pvp1Iva0 = nuevoPvp1Iva0.toFixed(2);
          this.pvp1 = nuevoPvp1.toFixed(2);
          return;
        }

        if (op === 'PVP1') {
          const nuevoPvp1Iva = pvp1Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp1 = pvp1Iva0.plus(nuevoPvp1Iva);

          this.pvp1 = nuevoPvp1.toFixed(2);

          const gananciaPvp1 = pvp1Iva0.minus(costoConIva);
          this.gananciaPvp1 = gananciaPvp1.toFixed(2);
          this.pGananciaPvp1 = gananciaPvp1.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.pvp1Iva0 = pvp1Iva0.toFixed(2);
            const nuevoPvp1Iva = pvp1Iva0.mul(iva).div(100).toFixed(2);
            this.pvp1 = pvp1Iva0.plus(nuevoPvp1Iva).toFixed(2);
            this.pGananciaPvp1 = '100';
            this.gananciaPvp1 = pvp1Iva0.toFixed(2);
          }
          return;
        }
      }

      if (pvp === 2) {
        if (op === 'PGANANCIAPVP2') {
          const gananciaPvp2 = costoConIva.mul(pGananciaPvp2).div(100);
          const nuevoPvp2Iva0 = gananciaPvp2.plus(costoConIva);
          const nuevoPvp2Iva = nuevoPvp2Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp2 = nuevoPvp2Iva0.plus(nuevoPvp2Iva);

          this.gananciaPvp2 = gananciaPvp2.toFixed(2);
          this.pvp2Iva0 = nuevoPvp2Iva0.toFixed(2);
          this.pvp2 = nuevoPvp2.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP2') {
          const gananciaPvp2 = new Decimal(this.gananciaPvp2 || 0);
          const nuevoPvp2Iva0 = gananciaPvp2.plus(costoConIva);
          const nuevoPvp2Iva = nuevoPvp2Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp2 = nuevoPvp2Iva0.plus(nuevoPvp2Iva);
          const nuevoPorcentajeGanancia = gananciaPvp2.mul(100).div(costoConIva);
          

          this.pGananciaPvp2 = nuevoPorcentajeGanancia.toFixed(0);
          this.pvp2Iva0 = nuevoPvp2Iva0.toFixed(2);
          this.pvp2 = nuevoPvp2.toFixed(2);
          return;
        }

        if (op === 'PVP2') {
          const nuevoPvp2Iva = pvp2Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp2 = pvp2Iva0.plus(nuevoPvp2Iva);

          this.pvp2 = nuevoPvp2.toFixed(2);

          const gananciaPvp2 = pvp2Iva0.minus(costoConIva);
          this.gananciaPvp2 = gananciaPvp2.toFixed(2);
          this.pGananciaPvp2 = gananciaPvp2.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.pvp2Iva0 = pvp2Iva0.toFixed(2);
            const nuevoPvp2Iva = pvp2Iva0.mul(iva).div(100).toFixed(2);
            this.pvp2 = pvp2Iva0.plus(nuevoPvp2Iva).toFixed(2);
            this.pGananciaPvp2 = '100';
            this.gananciaPvp2 = pvp2Iva0.toFixed(2);
          }
          return;
        }
      }

      if (pvp === 3) {
        if (op === 'PGANANCIAPVP3') {
          const gananciaPvp3 = costoConIva.mul(pGananciaPvp3).div(100);
          const nuevoPvp3Iva0 = gananciaPvp3.plus(costoConIva);
          const nuevoPvp3Iva = nuevoPvp3Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp3 = nuevoPvp3Iva0.plus(nuevoPvp3Iva);

          this.gananciaPvp3 = gananciaPvp3.toFixed(2);
          this.pvp3Iva0 = nuevoPvp3Iva0.toFixed(2);
          this.pvp3 = nuevoPvp3.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP3') {
          const gananciaPvp3 = new Decimal(this.gananciaPvp3 || 0);
          const nuevoPvp3Iva0 = gananciaPvp3.plus(costoConIva);
          const nuevoPvp3Iva = nuevoPvp3Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp3 = nuevoPvp3Iva0.plus(nuevoPvp3Iva);
          const nuevoPorcentajeGanancia = gananciaPvp3.mul(100).div(costoConIva);
          

          this.pGananciaPvp3 = nuevoPorcentajeGanancia.toFixed(0);
          this.pvp3Iva0 = nuevoPvp3Iva0.toFixed(2);
          this.pvp3 = nuevoPvp3.toFixed(2);
          return;
        }

        if (op === 'PVP3') {
          const nuevoPvp3Iva = pvp3Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp3 = pvp3Iva0.plus(nuevoPvp3Iva);

          this.pvp3 = nuevoPvp3.toFixed(2);

          const gananciaPvp3 = pvp3Iva0.minus(costoConIva);
          this.gananciaPvp3 = gananciaPvp3.toFixed(2);
          this.pGananciaPvp3 = gananciaPvp3.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.pvp3Iva0 = pvp3Iva0.toFixed(2);
            const nuevoPvp3Iva = pvp3Iva0.mul(iva).div(100).toFixed(2);
            this.pvp3 = pvp3Iva0.plus(nuevoPvp3Iva).toFixed(2);
            this.pGananciaPvp3 = '100';
            this.gananciaPvp3 = pvp3Iva0.toFixed(2);
          }
          return;
        }
      }

      if (pvp === 4) {
        if (op === 'PGANANCIAPVP4') {
          const gananciaPvp4 = costoConIva.mul(pGananciaPvp4).div(100);
          const nuevoPvp4Iva0 = gananciaPvp4.plus(costoConIva);
          const nuevoPvp4Iva = nuevoPvp4Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp4 = nuevoPvp4Iva0.plus(nuevoPvp4Iva);

          this.gananciaPvp4 = gananciaPvp4.toFixed(2);
          this.pvp4Iva0 = nuevoPvp4Iva0.toFixed(2);
          this.pvp4 = nuevoPvp4.toFixed(2);
          return;
        }

        if (op === 'GANANCIAPVP4') {
          const gananciaPvp4 = new Decimal(this.gananciaPvp4 || 0);
          const nuevoPvp4Iva0 = gananciaPvp4.plus(costoConIva);
          const nuevoPvp4Iva = nuevoPvp4Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp4 = nuevoPvp4Iva0.plus(nuevoPvp4Iva);
          const nuevoPorcentajeGanancia = gananciaPvp4.mul(100).div(costoConIva);
          

          this.pGananciaPvp4 = nuevoPorcentajeGanancia.toFixed(0);
          this.pvp4Iva0 = nuevoPvp4Iva0.toFixed(2);
          this.pvp4 = nuevoPvp4.toFixed(2);
          return;
        }

        if (op === 'PVP4') {
          const nuevoPvp4Iva = pvp4Iva0.mul(iva).div(100).toFixed(2);
          const nuevoPvp4 = pvp4Iva0.plus(nuevoPvp4Iva);

          this.pvp4 = nuevoPvp4.toFixed(2);

          const gananciaPvp4 = pvp4Iva0.minus(costoConIva);
          this.gananciaPvp4 = gananciaPvp4.toFixed(2);
          this.pGananciaPvp4 = gananciaPvp4.div(costoConIva).times(100).toFixed(0);
          if (costoIva0.isZero()) {
            this.pvp4Iva0 = pvp4Iva0.toFixed(2);
            const nuevoPvp4Iva = pvp4Iva0.mul(iva).div(100).toFixed(2);
            this.pvp4 = pvp4Iva0.plus(nuevoPvp4Iva).toFixed(2);
            this.pGananciaPvp4 = '100';
            this.gananciaPvp4 = pvp4Iva0.toFixed(2);
          }
          return;
        }
      }
    }
  }

  resetPvp(form: any, op: number, esHabilidado: boolean) {
    if (form === 'NEW') {
      if (op === 2 && !esHabilidado) {
        this.newProducto.pGananciaPvp2 = '0';
        this.newProducto.gananciaPvp2 = '0.00';
        this.newProducto.pvp2Iva0 = '0.00';
        this.newProducto.pvp2 = '0.00';
      }
      if (op === 3 && !esHabilidado) {
        this.newProducto.pGananciaPvp3 = '0';
        this.newProducto.gananciaPvp3 = '0.00';
        this.newProducto.pvp3Iva0 = '0.00';
        this.newProducto.pvp3 = '0.00';
      }
      if (op === 4 && !esHabilidado) {
        this.newProducto.pGananciaPvp4 = '0';
        this.newProducto.gananciaPvp4 = '0.00';
        this.newProducto.pvp4Iva0 = '0.00';
        this.newProducto.pvp4 = '0.00';
      }
    } else {
      if (op === 2 && !esHabilidado) {
        this.pGananciaPvp2 = '0';
        this.gananciaPvp2 = '0.00';
        this.pvp2Iva0 = '0.00';
        this.pvp2 = '0.00';
      }
      if (op === 3 && !esHabilidado) {
        this.pGananciaPvp3 = '0';
        this.gananciaPvp3 = '0.00';
        this.pvp3Iva0 = '0.00';
        this.pvp3 = '0.00';
      }
      if (op === 4 && !esHabilidado) {
        this.pGananciaPvp4 = '0';
        this.gananciaPvp4 = '0.00';
        this.pvp4Iva0 = '0.00';
        this.pvp4 = '0.00';
      }
    }

  }

  onChangeCheckbox(form: any, level: number): void {
    if (form === 'NEW') {
      if (level === 1 && !this.newProducto.habilitarPvp1) {
        this.newProducto.habilitarPvp2 = false;
        this.newProducto.pGananciaPvp2 = '0';
        this.newProducto.gananciaPvp2 = '0.00';
        this.newProducto.pvp2Iva0 = '0.00';
        this.newProducto.pvp2 = '0.00';
        this.newProducto.habilitarPvp3 = false;
        this.newProducto.pGananciaPvp3 = '0';
        this.newProducto.gananciaPvp3 = '0.00';
        this.newProducto.pvp3Iva0 = '0.00';
        this.newProducto.pvp3 = '0.00';
        this.newProducto.habilitarPvp4 = false;
        this.newProducto.pGananciaPvp4 = '0';
        this.newProducto.gananciaPvp4 = '0.00';
        this.newProducto.pvp4Iva0 = '0.00';
        this.newProducto.pvp4 = '0.00';
      } else if (level === 2 && !this.newProducto.habilitarPvp2) {
        this.newProducto.habilitarPvp3 = false;
        this.newProducto.pGananciaPvp3 = '0';
        this.newProducto.gananciaPvp3 = '0.00';
        this.newProducto.pvp3Iva0 = '0.00';
        this.newProducto.pvp3 = '0.00';
        this.newProducto.habilitarPvp4 = false;
        this.newProducto.pGananciaPvp4 = '0';
        this.newProducto.gananciaPvp4 = '0.00';
        this.newProducto.pvp4Iva0 = '0.00';
        this.newProducto.pvp4 = '0.00';
      } else if (level === 3 && !this.newProducto.habilitarPvp3) {
        this.newProducto.habilitarPvp4 = false;
        this.newProducto.pGananciaPvp4 = '0';
        this.newProducto.gananciaPvp4 = '0.00';
        this.newProducto.pvp4Iva0 = '0.00';
        this.newProducto.pvp4 = '0.00';
      }
    } else {
      if (level === 1 && !this.habilitarPvp1) {
        this.habilitarPvp2 = false;
        this.pGananciaPvp2 = '0';
        this.gananciaPvp2 = '0.00';
        this.pvp2Iva0 = '0.00';
        this.pvp2 = '0.00';
        this.habilitarPvp3 = false;
        this.pGananciaPvp3 = '0';
        this.gananciaPvp3 = '0.00';
        this.pvp3Iva0 = '0.00';
        this.pvp3 = '0.00';
        this.habilitarPvp4 = false;
        this.pGananciaPvp4 = '0';
        this.gananciaPvp4 = '0.00';
        this.pvp4Iva0 = '0.00';
        this.pvp4 = '0.00';
      } else if (level === 2 && !this.habilitarPvp2) {
        this.habilitarPvp3 = false;
        this.pGananciaPvp3 = '0';
        this.gananciaPvp3 = '0.00';
        this.pvp3Iva0 = '0.00';
        this.pvp3 = '0.00';
        this.habilitarPvp4 = false;
        this.pGananciaPvp4 = '0';
        this.gananciaPvp4 = '0.00';
        this.pvp4Iva0 = '0.00';
        this.pvp4 = '0.00';
      } else if (level === 3 && !this.habilitarPvp3) {
        this.habilitarPvp4 = false;
        this.pGananciaPvp4 = '0';
        this.gananciaPvp4 = '0.00';
        this.pvp4Iva0 = '0.00';
        this.pvp4 = '0.00';
      }
    }
  }

}