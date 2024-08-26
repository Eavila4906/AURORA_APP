import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/service/app.service';
import { EmpresasService } from './services/empresas.service';

interface Company {
  name: string;
  description: string;
  status: number;
}

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  companies: any[] = [];
  id: number = 0;
  name: string = '';
  description: string = '';
  status: number = 1;

  newCompany: Company = {
    name: '',
    description: '',
    status: 1
  };

  //Search
  search: string = '';
  companiesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newCompany.name = '';
    this.newCompany.description = '';
    this.newCompany.status = 1;
  }

  constructor(
    private AppService: AppService,
    private EmpresasService: EmpresasService,
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
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );

    this.EmpresasService.getAll().subscribe( 
      response => {
        this.companies = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        });
        this.companiesFilter = this.companies;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
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
    this.getCompany(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getCompany(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */

  getCompany(id: number) {
    this.EmpresasService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.name = response.data.name;
        this.description = response.data.description;
        this.status = response.data.status;
      }
    );
  }

  create() {
    let data = {
      name: this.newCompany.name, 
      description: this.newCompany.description, 
      status: this.newCompany.status
    };

    this.EmpresasService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', {closeButton: true});
          this.ngOnInit();
          this.resetForm();
          this.ModalNew?.hide();
        }
      },
      error => {
        this.toastr.warning(error, '¡Atención!', {closeButton: true});
      }
    );
  }

  edit(id: number) {
    let data = {
      id: id,
      name: this.name, 
      description: this.description, 
      status: this.status
    };

    this.EmpresasService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', {closeButton: true});
          this.ngOnInit();
          this.ModalEdit?.hide();
          this.resetForm();
        }
      },
      error => {
        this.toastr.warning(error, '¡Atención!', {closeButton: true});
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
        this.EmpresasService.delete(id).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', {closeButton: true});
              this.ngOnInit();
              this.resetForm();
            }
          },
          error => {
            this.toastr.warning(error, '¡Atención!', {closeButton: true});
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
    this.companiesFilter = this.companies.filter((companie: { name: string, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = companie.name.toLowerCase().includes(this.search.toLowerCase()) || 
        companie.r_status.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.companiesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
