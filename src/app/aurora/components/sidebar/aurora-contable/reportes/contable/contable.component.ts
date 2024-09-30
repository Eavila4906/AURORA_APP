import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { ContableService } from './services/contable.service'; 

@Component({
  selector: 'app-contable',
  templateUrl: './contable.component.html',
  styleUrls: ['./contable.component.css']
})
export class ContableComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  fechaInicio: string = new Date().toISOString().slice(0, 10);
  fechaFin: string = new Date().toISOString().slice(0, 10);
  tipoOp: string = 'Dia';

  rango: string = '';
  opcion: string = '';
  cantidad_ventas: number = 0;
  total_ventas: string = '$0';
  cantidad_compras: number = 0;
  total_compras: string = '$0';
  cantidad_cuentasPorCobrar: number = 0;
  total_cuentasPorCobrar: string = '$0';
  cantidad_cuentasPorPagar: number = 0;
  total_cuentasPorPagar: string = '$0';
  cantidad_ventasPagadas: number = 0;
  total_ventasPagadas: string = '$0';
  cantidad_comprasPagadas: number = 0;
  total_comprasPagadas: string = '$0';
  total_ingresos: string = '$0';
  total_egresos: string = '$0';
  total_ganancias: string = '$0';

  reportes: boolean = false;

  resetForm() {
    this.fechaInicio = new Date().toISOString().slice(0, 10);
    this.fechaFin = new Date().toISOString().slice(0, 10);
    this.tipoOp = 'Dia';

    this.reportes = false;
  }

  constructor(
    private AppService: AppService,
    private ContableService: ContableService,
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
  }

  reporteContable() {
    if (this.tipoOp === '0') {
      this.toastr.warning('Es necesario especificar el rango', '¡Atención!', { closeButton: true });
      return;
    }

    let data = {
      data: {
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        tipoOp: this.tipoOp,
      }
    };

    this.ContableService.reporteContable(data).subscribe(
      response => {
        this.rango = response.data[0].rango;
        this.opcion = response.data[0].opcion;
        this.cantidad_ventas = response.data[0].cantidad_ventas;
        this.total_ventas = '$'+response.data[0].total_ventas;
        this.cantidad_compras = response.data[0].cantidad_compras;
        this.total_compras = '$'+response.data[0].total_compras;
        this.cantidad_cuentasPorCobrar = response.data[0].cantidad_cuentasPorCobrar;
        this.total_cuentasPorCobrar = '$'+response.data[0].total_cuentasPorCobrar;
        this.cantidad_cuentasPorPagar = response.data[0].cantidad_cuentasPorPagar;
        this.total_cuentasPorPagar = '$'+response.data[0].total_cuentaPorPagar;
        this.cantidad_ventasPagadas = response.data[0].cantidad_ventasPagadas;
        this.total_ventasPagadas = '$'+response.data[0].total_ventasPagadas;
        this.cantidad_comprasPagadas = response.data[0].cantidad_comprasPagadas;
        this.total_comprasPagadas = '$'+response.data[0].total_comprasPagadas;
        this.total_ingresos = '$'+response.data[0].total_ingresos;
        this.total_egresos = '$'+response.data[0].total_egresos;
        this.total_ganancias = '$'+response.data[0].total_ganancias;

        this.reportes =  true;
      }
    );
  }

}
