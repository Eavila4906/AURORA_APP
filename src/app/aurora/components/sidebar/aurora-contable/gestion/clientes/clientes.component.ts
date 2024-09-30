import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { ClientesService } from './services/clientes.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';

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
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  clientes: any[] = [];
  id: number = 0;
  nombres: string = '';
  apellidos: string = '';
  identificacion_id: number = 0;
  numeroIdentificacion: string = '';
  telefono: string = '';
  email: string = '';
  direccion: string = '';
  estado: string = 'Activo';

  tiposIdentificacion: any[] = [];
  tipoIdentificacion: string = '';

  newCliente: Cliente = {
    nombres: '',
    apellidos: '',
    identificacion_id: 0,
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  //Search
  search: string = '';
  clientesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newCliente.nombres = '';
    this.newCliente.apellidos = '';
    this.newCliente.identificacion_id = 0;
    this.newCliente.numeroIdentificacion = '';
    this.newCliente.telefono = '';
    this.newCliente.email = '';
    this.newCliente.direccion = '';

    this.id = 0;
    this.nombres = '';
    this.apellidos = '';
    this.identificacion_id = 0;
    this.numeroIdentificacion = '';
    this.telefono = '';
    this.email = '';
    this.direccion = '';
    this.estado = 'Activo';
  }

  constructor(
    private AppService: AppService,
    private ClientesService: ClientesService,
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

    this.ClientesService.getAll().subscribe(
      response => {
        this.clientes = response.data.sort((a: any, b: any) => b.id - a.id);
        this.clientesFilter = this.clientes;
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
    this.getCliente(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getCliente(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */ 

  getCliente(id: number) {
    this.ClientesService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.nombres = response.data.nombres;
        this.apellidos = response.data.apellidos;
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
          this.ModalNew?.hide();
        }
      }
    );
  }

  edit(id: number) {
    let data = {
      data: {
        id: id,
        nombres: this.nombres,
        apellidos: this.apellidos,
        identificacion_id: this.identificacion_id,
        numeroIdentificacion: this.numeroIdentificacion,
        telefono: this.telefono,
        email: this.email,
        direccion: this.direccion,
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.ClientesService.edit(data).subscribe(
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
        this.ClientesService.delete(id).subscribe(
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
    this.clientesFilter = this.clientes.filter((cliente: { 
      nombres: string, 
      apellidos: string,
      numeroIdentificacion: string,
      identificacion: string,
      direccion: string,
      estado: string 
    }) => {
      let filter = true;
      if (this.search) {
        filter = cliente.nombres?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.apellidos?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.numeroIdentificacion?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.identificacion?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.direccion?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.estado?.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.clientesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
