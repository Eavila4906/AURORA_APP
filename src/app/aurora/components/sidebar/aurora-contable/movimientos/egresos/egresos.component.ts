import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { MovimientosService } from '../services/movimientos.service';
import { ProductosService } from '../../gestion/productos/services/productos.service';

interface Egreso {
  movimiento_id: number;
  fecha: string;
  observacion: string;
}

@Component({
  selector: 'app-egresos',
  templateUrl: './egresos.component.html',
  styleUrls: ['./egresos.component.css']
})
export class EgresosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  egresos: any[] = [];
  id: number = 0;
  movimiento_id: number = 0;
  fecha: string = this.AppService.getTimeZoneCurrentDate();
  observacion: string = '';
  estado: string = 'Activo';

  productos: any[] = [];
  productosSelected: { id: number, producto_id?: number, descripcion: string, cantidad: 0 }[] = [];

  newIngreso: Egreso = {
    movimiento_id: 2,
    fecha: this.AppService.getTimeZoneCurrentDate(),
    observacion: ''
  };

  //Search
  search: string = '';
  egresosFilter: any[] = [];
  productosFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newIngreso.movimiento_id = 2;
    this.newIngreso.fecha = this.AppService.getTimeZoneCurrentDate();
    this.newIngreso.observacion = '';
    this.productosSelected = [],

    this.id = 0;
    this.movimiento_id = 0;
    this.fecha = this.AppService.getTimeZoneCurrentDate();
    this.observacion = '';
    this.estado = 'Activo';
  }

  constructor(
    private AppService: AppService,
    private EgresosService: MovimientosService,
    private ProductosService: ProductosService,
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

    this.EgresosService.getAll().subscribe(
      response => {
        this.egresos = response.data.filter((ingreso: any) => ingreso.movimiento_id === 2)
          .sort((a: any, b: any) => b.id - a.id);
        this.egresosFilter = this.egresos;
        this.loading = false;
      }
    );

    this.getProductos();
  }

  /**
   * MODALS
   */
  openModalCreate() {
    this.productosSelected = [];
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.productosSelected = [];
    this.getEgreso(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getEgreso(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getEgreso(id: number) {
    this.EgresosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.movimiento_id = response.data.movimiento_id;
        this.fecha = response.data.fecha;
        this.observacion = response.data.observacion;
        this.productosSelected = response.data.productos.map( (producto: any) => { 
          return { 
            id: producto.id,
            producto_id: producto.producto_id, 
            descripcion: producto.descripcion, 
            cantidad: producto.cantidad 
          } 
        });
      }
    );
  }

  getProductos() {
    this.ProductosService.getAll().subscribe( 
      response => {
        this.productos = response.data.filter( (producto: any) => producto.estado === 'Activo');
        this.productosFilter = this.productos;
      }
    ); 
  }

  create() {
    let data = {
      data: {
        cabecera: {
          movimiento_id: this.newIngreso.movimiento_id, 
          fecha: this.newIngreso.fecha, 
          observacion: this.newIngreso.observacion
        },
        productos: this.productosSelected.map(producto => { 
          return { 
            producto_id: producto.producto_id ? producto.producto_id : producto.id, 
            cantidad: producto.cantidad 
          } 
        }),
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.EgresosService.create(data).subscribe(
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
        cabecera: {
          movimiento_id: this.movimiento_id, 
          fecha: this.fecha, 
          observacion: this.observacion
        },
        productos: this.productosSelected.map(producto => { 
          return {
            producto_id: producto.producto_id ? producto.producto_id : producto.id, 
            cantidad: producto.cantidad 
          }
        }),
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.EgresosService.edit(data).subscribe(
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
        this.EgresosService.delete(id).subscribe(
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
  Search(op: number) {
    if (op == 1) {
      this.egresosFilter = this.egresos.filter((egreso: { fecha: string }) => {
        let filter = true;
        if (this.search) {
          filter = egreso.fecha.toLowerCase().includes(this.search.toLowerCase());
        }
        return filter;
      });
    } else {
      this.productosFilter = this.productos.filter((producto: { codigo: string, descripcion: string }) => {
        let filter = true;
        if (this.search) {
          filter = producto.codigo.toLowerCase().includes(this.search.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(this.search.toLowerCase());
        }
        return filter;
      });
    }
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.egresosFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  public onRowClick(item: any) {
    this.productosSelected.push({ id: item.id, descripcion: item.descripcion, cantidad: 0 });
  }

  public deleteProducto(index: number, idProducto?: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (idProducto) {
          this.EgresosService.deleteProducto(idProducto).subscribe(
            response => {
              if (response.data) {
                this.toastr.success(response.message, '¡Listo!', {closeButton: true});
              }
            }
          );
        }

        this.productosSelected.splice(index, 1)
      }
    })
  }

}
