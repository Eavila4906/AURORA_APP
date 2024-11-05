import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { ProveedoresService } from './services/proveedores.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';

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
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  proveedores: any[] = [];
  id: number = 0;
  proveedor: string = '';
  descripcion: string = '';
  identificacion_id: number = 0;
  numeroIdentificacion: string = '';
  telefono: string = '';
  email: string = '';
  direccion: string = '';
  estado: string = 'Activo';

  tiposIdentificacion: any[] = [];
  tipoIdentificacion: string = '';

  newProveedor: Proveedor = {
    proveedor: '',
    descripcion: '',
    identificacion_id: 0,
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  //Search
  search: string = '';
  proveedoresFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newProveedor.proveedor = '';
    this.newProveedor.descripcion = '';
    this.newProveedor.identificacion_id = 0;
    this.newProveedor.numeroIdentificacion = '';
    this.newProveedor.telefono = '';
    this.newProveedor.email = '';
    this.newProveedor.direccion = '';

    this.id = 0;
    this.proveedor = '';
    this.descripcion = '';
    this.identificacion_id = 0;
    this.numeroIdentificacion = '';
    this.telefono = '';
    this.email = '';
    this.direccion = '';
    this.estado = 'Activo';
  }

  constructor(
    private AppService: AppService,
    private ProveedoresService: ProveedoresService,
    private TiposIdentificacionService: OtherServicesService,
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

    this.ProveedoresService.getAll().subscribe(
      response => {
        this.proveedores = response.data.sort((a: any, b: any) => b.id - a.id);
        this.proveedoresFilter = this.proveedores;
        this.loading = false;
      }
    );

    this.getTiposIdentificacion();
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getProveedor(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getProveedor(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */ 

  getProveedor(id: number) {
    this.ProveedoresService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.proveedor = response.data.proveedor;
        this.descripcion = response.data.descripcion;
        this.identificacion_id = response.data.identificacion_id;
        this.tipoIdentificacion = response.data.identificacion;
        this.numeroIdentificacion = response.data.numeroIdentificacion;
        this.telefono = response.data.telefono;
        this.email = response.data.email;
        this.direccion = response.data.direccion;
        this.estado = response.data.estado;
      }
    );
  }

  getTiposIdentificacion() {
    this.TiposIdentificacionService.getTiposIdentificacion().subscribe(
      response => {
        this.tiposIdentificacion = response.data.filter( (tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  create() {
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
          this.ModalNew?.hide();
        }
      }
    );
  }

  edit(id: number) {
    let data = {
      data: {
        id: id,
        proveedor: this.proveedor,
        descripcion: this.descripcion,
        identificacion_id: this.identificacion_id,
        numeroIdentificacion: this.numeroIdentificacion,
        telefono: this.telefono,
        email: this.email,
        direccion: this.direccion,
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.ProveedoresService.edit(data).subscribe(
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
        this.ProveedoresService.delete(id).subscribe(
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
    this.proveedoresFilter = this.proveedores.filter((proveedor: { 
      proveedor: string, 
      numeroIdentificacion: string,
      identificacion: string,
      direccion: string,
      estado: string 
    }) => {
      let filter = true;
      if (this.search) {
        filter = proveedor.proveedor?.toLowerCase().includes(this.search.toLowerCase()) || 
        proveedor.numeroIdentificacion?.toLowerCase().includes(this.search.toLowerCase()) || 
        proveedor.identificacion?.toLowerCase().includes(this.search.toLowerCase()) || 
        proveedor.direccion?.toLowerCase().includes(this.search.toLowerCase()) || 
        proveedor.estado?.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.proveedoresFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
