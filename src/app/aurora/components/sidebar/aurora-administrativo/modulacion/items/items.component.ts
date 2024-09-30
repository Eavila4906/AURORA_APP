import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { ItemsService } from './services/items.service';
import { SubmodulosService } from '../submodulos/services/submodulos.service';
import { AplicacionesService } from '../../aplicaciones/services/aplicaciones.service';

interface Item {
  app_id: number;
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
  apps: any[] = [];
  submodules: any[] = [];
  id: number = 0;
  item: string = '';
  app_id: number = 0;
  app: string = '';
  submodule_id: number = 0;
  submodule: string = '';
  path: string = '';
  description: string = '';
  icon: string = '';
  status: number = 1;

  newItem: Item = {
    app_id: 0,
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
  submodulesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newItem.app_id = 0;
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
    private AplicacionesService: AplicacionesService,
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

    this.ItemsService.getAll().subscribe( 
      response => {
        this.items = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';
          return item;
        }).sort((a: any, b: any) => b.id - a.id);
        
        this.itemsFilter = this.items;
      }
    ); 
    
    this.getSubmodules();
    this.getApps();
  }

  /**
   * MODALS
   */
  openModalCreate() {
    this.submodulesFilter = this.submodules.filter(submodule => submodule.aurora_app.id == this.newItem.app_id);
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
        this.app_id = response.data.aurora_app.id;
        this.app = response.data.aurora_app.app;
        this.submodule_id = response.data.submodule_id;
        this.submodule = response.data.submodule.submodule;
        this.path = response.data.path;
        this.description = response.data.description;
        this.icon = response.data.icon;
        this.status = response.data.status;

        this.submodulesFilter = this.submodules.filter(submodule => submodule.aurora_app.id == this.app_id);
      }
    );
  }

  getSubmodules () {
    this.SubmodulosService.getAll().subscribe( 
      response => {
        this.submodules = response.data;
        this.submodulesFilter = this.submodules;
      }
    ); 
  }
  
  getApps() {
    this.AplicacionesService.getAll().subscribe(
      response => {
        this.apps = response.data.filter( (app: any) => app.status === 1);
      }
    );
  }

  create() {
    let data = {
      app_id: this.newItem.app_id,
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
      }
    );
  }

  edit(id: number) {
    let data = {
      id: id,
      app_id: this.app_id,
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
    this.itemsFilter = this.items.filter((item: { item: string, submodule: { submodule: string }, aurora_app: {app: string}, r_status: string }) => {
      let filter = true;
      if (this.search) {
        filter = item.item.toLowerCase().includes(this.search.toLowerCase()) || 
        item.submodule.submodule.toLowerCase().includes(this.search.toLowerCase()) || 
        item.aurora_app.app.toLowerCase().includes(this.search.toLowerCase()) || 
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

  onAppChange(op: number) {
    let app_id = op === 1 ? this.newItem.app_id : this.app_id;
    this.submodulesFilter = this.submodules.filter(submodule => submodule.aurora_app.id == app_id);
    this.submodule_id = 0;
  }

}
