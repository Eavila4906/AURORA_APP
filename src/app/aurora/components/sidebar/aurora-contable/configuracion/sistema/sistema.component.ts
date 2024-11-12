import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { SistemaService } from './services/sistema.service'; 

@Component({
  selector: 'app-sistema',
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.css']
})
export class SistemaComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  id: number = 0;
  ventaSincronizadaStock: string = 'SI';

  resetForm() {
    this.id = 0;
    this.ventaSincronizadaStock = 'SI';
  }

  constructor(
    private AppService: AppService,
    private SistemaService: SistemaService,
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

    this.getConfiguracionSistema();
  }

  /**
   * SERVICES
   */

  getConfiguracionSistema() {
    this.SistemaService.get().subscribe(
      response => {
        this.id = response.data.id;
        this.ventaSincronizadaStock = response.data.ventaSincroStock;
      }
    );
  }

  save() {
    if (this.id === 0) {
      this.create();
    } else {
      this.edit();
    }
  }

  create() {
    let data = {
      data: {
        ventaSincroStock: this.ventaSincronizadaStock,
        valor1: 'null',
        valor2: 'null',
        valor3: 'null',
        valor4: 'null',
        valor5: 'null',
        valor6: 'null',
        valor7: 'null',
        valor8: 'null',
        valor9: 'null',
        valor10: 'null',
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.SistemaService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.resetForm();
          this.ngOnInit();
        }
      }
    );
  }

  edit() {
    let data = {
      data: {
        ventaSincroStock: this.ventaSincronizadaStock,
        valor1: 'null',
        valor2: 'null',
        valor3: 'null',
        valor4: 'null',
        valor5: 'null',
        valor6: 'null',
        valor7: 'null',
        valor8: 'null',
        valor9: 'null',
        valor10: 'null',
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.SistemaService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.resetForm();
          this.ngOnInit();
        }
      }
    );
  }

  delete(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este perfil?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.SistemaService.delete().subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', { closeButton: true });
              this.ngOnInit();
              this.resetForm();
            }
          }
        );
      }
    });
  }


}
