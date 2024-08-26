import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/service/app.service';
import { UsuariosService } from './services/usuarios.service';
import { RolesService } from '../roles/services/roles.service';
import { EmpresasService } from '../empresas/services/empresas.service';

interface User {
  name: string;
  lastname: string;
  username: string;
  email: string;
  rol_id: number;
  company_id: number;
  password: string;
  cpassword: string;
  status: number;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;
  @ViewChild('ModalAssignRol') ModalAssignRol?: ModalDirective;
  @ViewChild('ModalAssignCompany') ModalAssignCompany?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  users: any[] = [];
  roles: any[] = [];
  userRoles: any[] = [];
  companies: any[] = [];
  userCompanies: any[] = [];
  id: number = 0;
  name: string = '';
  lastname: string = '';
  username: string = '';
  email: string = '';
  rol_id: number = 0;
  company_id: number = 0;
  password: string = '';
  cpassword: string = '';
  status: number = 1;

  newUser: User = {
    name: '',
    lastname: '',
    username: '',
    email: '',
    rol_id: 0,
    company_id: 0,
    password: '',
    cpassword: '',
    status: 1
  };

  //Search
  search: string = '';
  searchUserRoles: string = '';
  searchUserCompanies: string = '';

  usersFilter: any[] = [];
  userRolesFilter: any[] = [];
  userCompaniesFilter: any[] = [];
  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newUser.name = '';
    this.newUser.lastname = '';
    this.newUser.username = '';
    this.newUser.email = '';
    this.newUser.rol_id = 0;
    this.newUser.password = '';
    this.newUser.cpassword = '';
    this.newUser.company_id = 0;
    this.newUser.status = 1;
  }

  constructor(
    private AppService: AppService,
    private UsuariosService: UsuariosService,
    private RolesService: RolesService,
    private EmpresasService: EmpresasService,
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

    this.UsuariosService.getAll().subscribe( 
      response => {
        this.users = response.data.map((item: any) => {
          item.status == 1 ? item.r_status = 'Activo' : item.r_status = 'Inactivo';

          if (item.roles && item.roles.length > 0) {
            item.rolesList = item.roles.map((role: any) => role.rol).join(', ');
          } else {
            item.rolesList = 'No asignado';
          }

          if (item.companies && item.companies.length > 0) {
            item.companiesList = item.companies.map((companies: any) => companies.name).join(', ');
          } else {
            item.rolesList = 'No asignado';
          }

          return item;
        });
        this.usersFilter = this.users;
        console.log(this.users)
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );
    
    this.getRoles();
    this.getEmpresas();
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getUser(id);
    this.password = '';
    this.cpassword = '';
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getUser(id);
    this.ModalSee?.show();
  }

  openModalAssignRol(id: number) {
    this.UsuariosService.getUserRole(id).subscribe(
      response => {
        this.id = response.data.user;
        this.userRoles = response.data.rol;
        this.userRolesFilter = this.userRoles;
      }
    );
    this.ModalAssignRol?.show();
  }

  openModalAssignCompany(id: number) {
    this.UsuariosService.getUserCompanies(id).subscribe(
      response => {
        this.id = response.data.user;
        this.userCompanies = response.data.name;
        this.userCompaniesFilter = this.userCompanies;
      }
    );
    this.ModalAssignCompany?.show();
  }

  /**
   * SERIVECES
   */

  getUser(id: number) {
    this.UsuariosService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.name = response.data.name;
        this.lastname = response.data.lastname;
        this.username = response.data.username;
        this.email = response.data.email;
        this.rol_id = response.data.rol_id;
        this.company_id = response.data.company_id;
        this.userRoles = response.data.roles.map((rol: any) => rol.rol).join(', ');
        this.userCompanies = response.data.companies.map((company: any) => company.name).join(', ');
        this.status = response.data.status;
      }
    );
  }

  getRoles () {
    this.RolesService.getAll().subscribe( 
      response => {
        this.roles = response.data;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );
  }

  getEmpresas () {
    this.EmpresasService.getAll().subscribe( 
      response => {
        this.companies = response.data;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );
  }

  create() {
    if (this.newUser.password != this.newUser.cpassword) {
      this.toastr.warning('Las contraseñas no coinciden', '¡Atención!', {closeButton: true});
      return;
    }

    let data = {
      name: this.newUser.name, 
      lastname: this.newUser.lastname, 
      username: this.newUser.username,
      email: this.newUser.email,
      rol_id: this.newUser.rol_id,
      company_id: this.newUser.company_id,
      password: this.newUser.password,
      status: this.newUser.status
    };

    this.UsuariosService.create(data).subscribe(
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
    if ((this.password != '' || this.cpassword != '') && this.password != this.cpassword) {
      this.toastr.warning('Las contraseñas no coinciden', '¡Atención!', {closeButton: true});
      return;
    }

    let data = {
      id: id,
      name: this.name, 
      lastname: this.lastname, 
      username: this.username,
      password: this.password,
      email: this.email,
      rol_id: this.rol_id,
      company_id: this.company_id,
      status: this.status
    };

    this.UsuariosService.edit(data).subscribe(
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
        this.UsuariosService.delete(id).subscribe(
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

  assignRol() {
    let formUserRoles = document.querySelector('#form-userroles');
    this.UsuariosService.assignRoles(formUserRoles).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.ModalAssignRol?.hide();
        }
      },
      error => {
        this.toastr.warning(error, '¡Atención!', {closeButton: true});
      }
    );
  }

  assignCompany() {
    let formUserCompanies = document.querySelector('#form-usercompanies');
    this.UsuariosService.assignCompanies(formUserCompanies).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.ModalAssignCompany?.hide();
        }
      },
      error => {
        this.toastr.warning(error, '¡Atención!', {closeButton: true});
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */
  clearSearch() {
    this.search = '';
    this.searchUserRoles = '';
    this.searchUserCompanies = '';
  }

  //Search
  Search(op: number) {
    if (op === 1) {
      this.usersFilter = this.users.filter((user: { 
        name: string, lastname: string, companiesList: string,
        username: string, r_status: string 
      }) => {
        let filter = true;
        if (this.search) {
          filter = user.name.toLowerCase().includes(this.search.toLowerCase()) || 
          user.lastname.toLowerCase().includes(this.search.toLowerCase()) || 
          user.username.toLowerCase().includes(this.search.toLowerCase()) || 
          user.companiesList.toLowerCase().includes(this.search.toLowerCase()) || 
          user.r_status.toLowerCase().startsWith(this.search.toLowerCase());
        }
        return filter;
      });
    } else if (op === 2) {
      this.userRolesFilter = this.userRoles.filter((userRol: { rol: string, }) => {
        let filter = true;
        if (this.searchUserRoles) {
          filter = userRol.rol.toLowerCase().includes(this.searchUserRoles.toLowerCase());
        }
        return filter;
      });
    } else if (op === 3) {
      this.userCompaniesFilter = this.userCompanies.filter((userCompany: { name: string, }) => {
        let filter = true;
        if (this.searchUserCompanies) {
          filter = userCompany.name.toLowerCase().includes(this.searchUserCompanies.toLowerCase());
        }
        return filter;
      });
    }
    
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.usersFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }
  
}
