import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";
  showPassword: boolean = false;
  loading = false;

  constructor(
    private AuthService: AuthService, 
    private router: Router, 
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.AuthService.verifyLogin();
  }

  mostrarContrasena() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.AuthService.login(this.email, this.password).subscribe(
      response => {
        if (response.data.access_token) {
          let rolId = response.data.user.roles[0].id;
          let rol = response.data.user.roles[0].rol;

          let userData = {
            access_token: response.data.access_token,
            user: {
              id: response.data.user.id,
              username: response.data.user.username,
              name: response.data.user.name,
              lastname: response.data.user.lastname
            }
          }

          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('rolId', rolId);
          localStorage.setItem('rol', rol);
          localStorage.setItem('empresa', response.data.user.companies[0].id);

          this.AuthService.setIsAuthenticated(true);
          this.router.navigate(['/principal']);
          this.toastr.success('Aurora Computer System', '¡Bienvenido!', {closeButton: true});
        }
      },error => {
        if (error.error.status == 401) {
          this.toastr.warning(error.error.message,'¡Atención!', {closeButton: true});
        } else if (error.error.status == 422) {
          this.toastr.warning('Los campos son obligatorios','¡Atención!', {closeButton: true});
        } else {
          this.toastr.error(error.error.error,'¡Error!', {closeButton: true});
        }
      }
    );
  }

}
