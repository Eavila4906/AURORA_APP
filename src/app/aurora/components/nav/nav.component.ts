import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from 'src/app/auth/services/auth.service';
import { AppService } from 'src/app/service/app.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  nombres: string = "";
  //user = localStorage.getItem('usuario');
  validarRol: boolean = false;

  userData: any = localStorage.getItem('userData');
  id_user: number = 0;
  user: string = '';
  username: string = '';
  rolId: any;
  rol: any;

  constructor(
    private AuthService: AuthService,
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
