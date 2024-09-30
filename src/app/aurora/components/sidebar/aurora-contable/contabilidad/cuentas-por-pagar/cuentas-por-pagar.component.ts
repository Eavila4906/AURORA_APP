import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { CuentasPorPagarService } from './services/cuentas-por-pagar.service'; 

@Component({
  selector: 'app-cuentas-por-pagar',
  templateUrl: './cuentas-por-pagar.component.html',
  styleUrls: ['./cuentas-por-pagar.component.css']
})
export class CuentasPorPagarComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  fechaInicio: string = new Date().toISOString().slice(0, 10);
  fechaFin: string = new Date().toISOString().slice(0, 10);

  cuentasPorPagar: any[] = [];

  //Search
  searchByRange: boolean = false;
  search: string = '';
  cuentasPorPagarFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  constructor(
    private AppService: AppService,
    private CuentasPorPagarService: CuentasPorPagarService,
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

    this.CuentasPorPagarService.getAll().subscribe(
      response => {
        this.cuentasPorPagar = response.data.sort((a: any, b: any) => b.id - a.id);
        this.cuentasPorPagarFilter = this.cuentasPorPagar
        this.loading = false;
      }
    );
  }

  byRange() {
    let data = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    };
    
    this.loading = true;

    this.CuentasPorPagarService.byRange(data).subscribe(
      response => {
        this.cuentasPorPagar = response.data.sort((a: any, b: any) => b.id - a.id);
        this.cuentasPorPagarFilter = this.cuentasPorPagar
        this.loading = false;
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    this.cuentasPorPagarFilter = this.cuentasPorPagar.filter((cuenta: { 
      fechaEmision: string,
      receptor: { nombres: string }
    }) => {
      let filter = true;
      if (this.search) {
        filter = cuenta.fechaEmision?.toLowerCase().includes(this.search.toLowerCase()) ||
        cuenta.receptor.nombres?.toLowerCase().includes(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.cuentasPorPagarFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  onCheckboxChange(event: any): void {
    this.searchByRange = event.target.checked;
  }

}
