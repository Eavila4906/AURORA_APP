import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/service/app.service';
import { ItemsService } from './services/items.service';
import { SubmodulosService } from '../submodulos/services/submodulos.service';

interface Item {
  item: string;
  submodule_id: number;
  path: string;
  description: string;
  icon: string;
  status: number;
}

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  items: any[] = [];
  submodules: any[] = [];
  id: number = 0;
  item: string = '';
  submodule_id: number = 0;
  submodule: string = '';
  path: string = '';
  description: string = '';
  icon: string = '';
  status: number = 1;

  newItem: Item = {
    item: '',
    submodule_id: 0,
    path: '',
    description: '',
    icon: '',
    status: 1
  };

  //Search
  search: string = '';
  itemsFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newItem.item = '';
    this.newItem.submodule_id = 0;
    this.newItem.path = '';
    this.newItem.description = '';
    this.newItem.icon = '';
    this.newItem.status = 1;
  }

  constructor(
    private AppService: AppService,
    private ItemsService: ItemsService,
    private SubmodulosService: SubmodulosService, 
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
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );

    this.ItemsService.getAll().subscribe( 
      response => {
        this.items = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        });
        this.itemsFilter = this.items;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    ); 
    
    this.getSubmodules();
  }

  /**
   * MODALS
   */
  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getItem(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getItem(id);
    this.ModalSee?.show();
  }

  /**
   * SERIVECES
   */
  getItem(id: number) {
    this.ItemsService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.item = response.data.item;
        this.submodule_id = response.data.submodule_id;
        this.submodule = response.data.submodule.submodule;
        this.path = response.data.path;
        this.description = response.data.description;
        this.icon = response.data.icon;
        this.status = response.data.status;
      }
    );
  }

  getSubmodules () {
    this.SubmodulosService.getAll().subscribe( 
      response => {
        this.submodules = response.data;
      }
    ); 
  }

  create() {
    let data = {
      item: this.newItem.item, 
      submodule_id: this.newItem.submodule_id,
      path: this.newItem.path, 
      description: this.newItem.description, 
      icon: this.newItem.icon, 
      status: this.newItem.status
    };

    this.ItemsService.create(data).subscribe(
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
      item: this.item, 
      submodule_id: this.submodule_id,
      path: this.path, 
      description: this.description, 
      icon: this.icon, 
      status: this.status
    };

    this.ItemsService.edit(data).subscribe(
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
        this.ItemsService.delete(id).subscribe(
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
    this.itemsFilter = this.items.filter((item: { item: string, submodule: { submodule: string }, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = item.item.toLowerCase().includes(this.search.toLowerCase()) || 
        item.submodule.submodule.toLowerCase().includes(this.search.toLowerCase()) || 
        item.r_status.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.itemsFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
