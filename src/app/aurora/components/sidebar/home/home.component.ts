import { Component, OnInit } from '@angular/core';

import { AppService } from 'src/app/services/app.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private AppService: AppService
  ) { }

  ngOnInit(): void {
    this.AppService.validarUsuario();
  }

}
