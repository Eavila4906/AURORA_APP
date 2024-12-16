import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';
@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit {

  constructor(
    private AuthService: AuthService
  ) { }

  ngOnInit(): void {
    if (!localStorage.getItem('userData')) {
      this.AuthService.verifyLogin();
    }
  }

}
