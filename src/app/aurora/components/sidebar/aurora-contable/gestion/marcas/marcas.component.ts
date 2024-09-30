import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { MarcasService } from './services/marcas.service';

interface Marca {
  marca: string;
  descripcion: string;
}

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  marcas: any[] = [];
  id: number = 0;
  marca: string = '';
  descripcion: string = '';
  estado: string = 'Activo';

  newMarca: Marca = {
    marca: '',
    descripcion: ''
  };

  //Search
  search: string = '';
  marcasFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newMarca.marca = '';
    this.newMarca.descripcion = '';
  }

  constructor(
    private AppService: AppService,
    private MarcasService: MarcasService,
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

    this.MarcasService.getAll().subscribe(
      response => {
        this.marcas = response.data.sort((a: any, b: any) => b.id - a.id);
        this.marcasFilter = this.marcas;
        this.loading = false;
      }
    );
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getMarca(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getMarca(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getMarca(id: number) {
    this.MarcasService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.marca = response.data.marca;
        this.descripcion = response.data.descripcion;
        this.estado = response.data.estado;
      }
    );
  }

  create() {
    let data = {
      data: {
        marca: this.newMarca.marca,
        descripcion: this.newMarca.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.MarcasService.create(data).subscribe(
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
        marca: this.marca,
        descripcion: this.descripcion,
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.MarcasService.edit(data).subscribe(
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
        this.MarcasService.delete(id).subscribe(
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
    this.marcasFilter = this.marcas.filter((marca: { marca: string, estado: string }) => {
      let filter = true;
      if (this.search) {
        filter = marca.marca.toLowerCase().includes(this.search.toLowerCase()) || 
        marca.estado.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.marcasFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
