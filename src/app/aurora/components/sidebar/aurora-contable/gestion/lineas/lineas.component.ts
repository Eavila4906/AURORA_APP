import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { LineasService } from './services/lineas.service';

interface Linea {
  linea: string;
  descripcion: string;
}

@Component({
  selector: 'app-lineas',
  templateUrl: './lineas.component.html',
  styleUrls: ['./lineas.component.css']
})
export class LineasComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  lineas: any[] = [];
  id: number = 0;
  linea: string = '';
  descripcion: string = '';
  estado: string = 'Activo';

  newLinea: Linea = {
    linea: '',
    descripcion: ''
  };

  //Search
  search: string = '';
  lineasFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newLinea.linea = '';
    this.newLinea.descripcion = '';
  }

  constructor(
    private AppService: AppService,
    private LineasService: LineasService,
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

    this.LineasService.getAll().subscribe( 
      response => {
        this.lineas = response.data.sort((a: any, b: any) => b.id - a.id);
        this.lineasFilter = this.lineas;
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
    this.getLinea(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getLinea(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getLinea(id: number) {
    this.LineasService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.linea = response.data.linea;
        this.descripcion = response.data.descripcion;
        this.estado = response.data.estado;
      }
    );
  }

  create() {
    let data = {
      data: {
        linea: this.newLinea.linea, 
        descripcion: this.newLinea.descripcion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.LineasService.create(data).subscribe(
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
        linea: this.linea, 
        descripcion: this.descripcion, 
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.LineasService.edit(data).subscribe(
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
        this.LineasService.delete(id).subscribe(
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
    this.lineasFilter = this.lineas.filter((linea: { linea: string, estado: string }) => {
      let filter = true;
      if (this.search) {
        filter = linea.linea.toLowerCase().includes(this.search.toLowerCase()) || 
        linea.estado.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.lineasFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
