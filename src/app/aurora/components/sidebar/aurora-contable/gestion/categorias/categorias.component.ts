import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { CategoriasService } from './services/categorias.service'; 

interface Categoria {
  categoria: string;
  descripcion: string;
}

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  categorias: any[] = [];
  id: number = 0;
  categoria: string = '';
  descripcion: string = '';
  estado: string = 'Activo';

  newCategoria: Categoria = {
    categoria: '',
    descripcion: ''
  };

  //Search
  search: string = '';
  categoriasFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newCategoria.categoria = '';
    this.newCategoria.descripcion = '';
  }

  constructor(
    private AppService: AppService,
    private CategoriasService: CategoriasService,
    private toastr:ToastrService,
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

    this.CategoriasService.getAll().subscribe( 
      response => {
        this.categorias = response.data.sort((a: any, b: any) => b.id - a.id);
        this.categoriasFilter = this.categorias;
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
    this.getCategoria(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getCategoria(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getCategoria(id: number) {
    this.CategoriasService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.categoria = response.data.categoria;
        this.descripcion = response.data.descripcion;
        this.estado = response.data.estado;
      }
    );
  }

  create() {
    let data = {
      data: {
        categoria: this.newCategoria.categoria, 
        descripcion: this.newCategoria.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.CategoriasService.create(data).subscribe(
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
        categoria: this.categoria, 
        descripcion: this.descripcion, 
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.CategoriasService.edit(data).subscribe(
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
        this.CategoriasService.delete(id).subscribe(
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
  Search() {
    this.categoriasFilter = this.categorias.filter((categoria: { categoria: string, estado: string }) => {
      let filter = true;
      if (this.search) {
        filter = categoria.categoria.toLowerCase().includes(this.search.toLowerCase()) || 
        categoria.estado.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.categoriasFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
