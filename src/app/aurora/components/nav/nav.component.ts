import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from 'src/app/auth/services/auth.service';
import { AppService } from 'src/app/services/app.service';
import { UsuariosService } from '../sidebar/aurora-administrativo/usuarios/services/usuarios.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  @ViewChild('ModalPasswordChange') ModalPasswordChange?: ModalDirective;

  nombres: string = "";
  //user = localStorage.getItem('usuario');
  validarRol: boolean = false;

  userData: any = localStorage.getItem('userData');
  id_user: number = 0;
  user: string = '';
  username: string = '';
  rolId: any;
  rol: any;

  currentPassword: string = '';
  newPassword: string = '';
  newPasswordConfirm: string = '';

  resetForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.newPasswordConfirm = '';
  }

  constructor(
    private AuthService: AuthService,
    private UsuariosService: UsuariosService,
    private router: Router,
    private AppService: AppService,
    private toastr: ToastrService
  ) {


  }
  ngOnInit(): void {
    if (this.userData !== null) {
      let userdata = JSON.parse(this.userData);
      this.username = userdata.user.username;
      this.rol = localStorage.getItem('rol') !== null ? localStorage.getItem('rol') : null;
    }
  }

  passwordChange() {
    Swal.fire({
      title: '<strong><i class="fas fa-key"></i> Cambiar contraseña</strong>',
      html: `
        <form id="passwordForm">
        <center>
            <div class="col-11">
              <div class="row">
                <div class="col-lg-12 col-sm-12">
                  <div class="mb-3 position-relative">
                    <input id="currentPassword" class="form-control password-field" type="password" placeholder="Contraseña actual*">
                  </div>
                </div>
                <div class="col-lg-6 col-sm-6">
                  <div class="mb-3 position-relative">
                    <input id="newPassword" class="form-control password-field" type="password" placeholder="Nueva contraseña*">
                  </div>
                </div>
                <div class="col-lg-6 col-sm-6">
                  <div class="mb-3 position-relative">
                    <input id="newPasswordConfirm" class="form-control password-field" type="password" placeholder="Confirme contraseña*">
                  </div>
                </div>
                <div class="col-lg-12 col-sm-12">
                  <div class="mb-3">
                    <a id="togglePasswords" type="button" mt-2">
                      <i class="fa-regular fa-square"></i> <smal>Mostrar contraseñas</smal>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </center>
        </form>
        <hr>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      width: '550px',
      preConfirm: () => {
        const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement).value;
        const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
        const newPasswordConfirm = (document.getElementById('newPasswordConfirm') as HTMLInputElement).value;

        // Validaciones
        if (!currentPassword || !newPassword || !newPasswordConfirm) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }

        if (newPassword !== newPasswordConfirm) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return null;
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordPattern.test(newPassword)) {
          Swal.showValidationMessage(
            'La nueva contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial. Ejemplo: "Usuario123!"'
          );
          return null;
        }

        return { currentPassword, newPassword };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { currentPassword, newPassword } = result.value!;
        const data = { currentPassword, newPassword };

        // Llamada al servicio para cambiar la contraseña
        this.UsuariosService.passwordChange(data).subscribe((response) => {
          if (response) {
            this.toastr.success(response.message, '¡Listo!', { closeButton: true });
            this.logout();
          }
        });
      }
    });

    // Agregar evento al botón para alternar visibilidad de contraseñas
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.id === 'togglePasswords' || target.closest('#togglePasswords')) {
        const button = document.getElementById('togglePasswords')!;
        const passwordFields = document.querySelectorAll('.password-field') as NodeListOf<HTMLInputElement>;

        // Verificar el estado actual y alternar
        const arePasswordsVisible = passwordFields[0].type === 'text';
        passwordFields.forEach((field) => {
          field.type = arePasswordsVisible ? 'password' : 'text';
        });

        // Cambiar texto e ícono del botón
        button.innerHTML = arePasswordsVisible
          ? '<i class="fa-regular fa-square"></i> <smal>Mostrar contraseñas</smal>'
          : '<i class="fa-regular fa-square-check"></i> <smal>Mostrar contraseñas</smal>';
      }
    });
  }

  logout() {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Desea cerrar la sesión?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.AuthService.logout().subscribe(
          response => {
            if (response) {
              this.toastr.success('', '¡Hasta pronto!', { closeButton: true });
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          },
          error => {
            this.toastr.error(error.message, '¡Error!', { closeButton: true });
          }
        );
      }
    });
  }

}
