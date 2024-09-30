import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { CuentasPorCobrarService } from './services/cuentas-por-cobrar.service';

@Component({
  selector: 'app-cuentas-por-cobrar',
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.css']
})
export class CuentasPorCobrarComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  fechaInicio: string = new Date().toISOString().slice(0, 10);
  fechaFin: string = new Date().toISOString().slice(0, 10);

  cuentasPorCobrar: any[] = [];

  //Search
  searchByRange: boolean = false;
  search: string = '';
  cuentasPorCobrarFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  constructor(
    private AppService: AppService,
    private CuentasPorCobrarService: CuentasPorCobrarService,
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

    this.CuentasPorCobrarService.getAll().subscribe(
      response => {
        this.cuentasPorCobrar = response.data.sort((a: any, b: any) => b.id - a.id);
        this.cuentasPorCobrarFilter = this.cuentasPorCobrar
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

    this.CuentasPorCobrarService.byRange(data).subscribe(
      response => {
        this.cuentasPorCobrar = response.data.sort((a: any, b: any) => b.id - a.id);
        this.cuentasPorCobrarFilter = this.cuentasPorCobrar
        this.loading = false;
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    this.cuentasPorCobrarFilter = this.cuentasPorCobrar.filter((cuenta: { 
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
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.cuentasPorCobrarFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  onCheckboxChange(event: any): void {
    this.searchByRange = event.target.checked;
  }

}
