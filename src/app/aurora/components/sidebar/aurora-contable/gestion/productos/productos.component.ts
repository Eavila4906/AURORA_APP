import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import JsBarcode from 'jsbarcode';
import * as pdfMake from "pdfmake/build/pdfmake";

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
  pvp1: number;
  pvp2: number;
  pvp3: number;
  pvp4: number;
  precioCompra: number;
  fechaElaboracion: string;
  fechaVencimiento: string;
  lote: string;
  medicion_id: number;
  iva_id: number;
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
  categoria_id: number = 0;
  marca_id: number = 0;
  linea_id: number = 0;
  proveedor_id: number = 0;
  descripcion: string = '';
  pvp1: number = 0.0;
  pvp2: number = 0.0;
  pvp3: number = 0.0;
  pvp4: number = 0.0;
  precioCompra: number = 0.0;
  fechaElaboracion: string = '';
  fechaVencimiento: string = '';
  lote: string = '';
  medicion_id: number = 0;
  iva_id: number = 0;
  estado: string = 'Activo';

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
    pvp1: 0.0,
    pvp2: 0.0,
    pvp3: 0.0,
    pvp4: 0.0,
    precioCompra: 0.0,
    fechaElaboracion: '',
    fechaVencimiento: '',
    lote: '',
    medicion_id: 0,
    iva_id: 0
  }

  //Search
  search: string = '';
  productosFilter: any[] = [];

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
    this.newProducto.pvp1 = 0.0;
    this.newProducto.pvp2 = 0.0;
    this.newProducto.pvp3 = 0.0;
    this.newProducto.pvp4 = 0.0;
    this.newProducto.precioCompra = 0.0;
    this.newProducto.fechaElaboracion = '';
    this.newProducto.fechaVencimiento = '';
    this.newProducto.lote = '';
    this.newProducto.medicion_id = 0;
    this.newProducto.iva_id = 0;

    this.id = 0;
    this.codigo = '';
    this.categoria_id = 0;
    this.marca_id = 0;
    this.linea_id = 0;
    this.proveedor_id = 0;
    this.descripcion = '';
    this.pvp1 = 0.0;
    this.pvp2 = 0.0;
    this.pvp3 = 0.0;
    this.pvp4 = 0.0;
    this.precioCompra = 0.0;
    this.fechaElaboracion = '';
    this.fechaVencimiento = '';
    this.lote = '';
    this.medicion_id = 0;
    this.iva_id = 0;
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
        this.categoria_id = response.data.categoria_id;
        this.categoria = response.data.nombreCategoria;
        this.marca_id = response.data.marca_id;
        this.marca = response.data.nombreMarca;
        this.linea_id = response.data.linea_id;
        this.linea = response.data.nombreLinea;
        this.proveedor_id = response.data.proveedor_id;
        this.proveedor = response.data.nombreProveedor;
        this.descripcion = response.data.descripcion;
        this.pvp1 = response.data.pvp1;
        this.pvp2 = response.data.pvp2;
        this.pvp3 = response.data.pvp3;
        this.pvp4 = response.data.pvp4;
        this.precioCompra = response.data.precioCompra;
        this.fechaElaboracion = response.data.fechaElaboracion;
        this.fechaVencimiento = response.data.fechaVencimiento;
        this.lote = response.data.lote;
        this.medicion_id = response.data.medicion_id;
        this.tipoMedicion = response.data.medicion;
        this.iva_id = response.data.iva_id;
        this.tipoIva = response.data.iva;
        this.estado = response.data.estado;
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

  create() {
    let data = {
      data: {
        codigo: this.newProducto.codigo,
        categoria_id: this.newProducto.categoria_id,
        marca_id: this.newProducto.marca_id,
        linea_id: this.newProducto.linea_id,
        proveedor_id: this.newProducto.proveedor_id,
        descripcion: this.newProducto.descripcion,
        pvp1: this.newProducto.pvp1,
        pvp2: this.newProducto.pvp2,
        pvp3: this.newProducto.pvp3,
        pvp4: this.newProducto.pvp4,
        precioCompra: this.newProducto.precioCompra,
        fechaElaboracion: this.newProducto.fechaElaboracion,
        fechaVencimiento: this.newProducto.fechaVencimiento,
        lote: this.newProducto.lote,
        medicion_id: this.newProducto.medicion_id,
        iva_id: this.newProducto.iva_id,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.ProductosService.create(data).subscribe(
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
        codigo: this.codigo,
        categoria_id: this.categoria_id,
        marca_id: this.marca_id,
        linea_id: this.linea_id,
        proveedor_id: this.proveedor_id,
        descripcion: this.descripcion,
        pvp1: this.pvp1,
        pvp2: this.pvp2,
        pvp3: this.pvp3,
        pvp4: this.pvp4,
        precioCompra: this.precioCompra,
        fechaElaboracion: this.fechaElaboracion,
        fechaVencimiento: this.fechaVencimiento,
        lote: this.lote,
        medicion_id: this.medicion_id,
        iva_id: this.iva_id,
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
    this.productosFilter = this.productos.filter((producto: {
      codigo: string,
      descripcion: string,
      nombreCategoria: string,
      nombreMarca: string,
      nombreLinea: string,
      proveedor: string,
      estado: string
    }) => {
      let filter = true;
      if (this.search) {
        filter = producto.codigo?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.descripcion?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.nombreCategoria?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.nombreMarca?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.nombreMarca?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.proveedor?.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.estado?.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
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

  generateUniqueRandomCode(): string {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  generateBarcodeImage(code: string): string {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, { format: 'CODE128', lineColor: '#000', width: 2, height: 50, displayValue: true });
    return canvas.toDataURL('image/png');
  }

}
