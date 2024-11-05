import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/services/auth.service';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit {

  constructor(
    private AppService: AppService,
    private router: Router, 
    private AuthService: AuthService
  ) { }

  ngOnInit(): void {
    if (!localStorage.getItem('userData')) {
      this.AuthService.verifyLogin();
    }
    this.AppService.validarRolesPorId();
    this.AppService.validarEmpresa();
  }

}
