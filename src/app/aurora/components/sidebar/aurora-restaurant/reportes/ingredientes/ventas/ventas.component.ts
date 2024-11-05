import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../service/reportes.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  fechaDesde: string = "";
  fechaHasta: string = "";
  validarRol: boolean = false;
  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;
  filtroNombres: string = "";

  listaIngredientes: any = null;
  listaIngredientesFiltrada: any = null;

  constructor(
    private reporteService: ReportesService, 
    private toastr: ToastrService,
    private AppService: AppService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const modulo = this.AppService.getEntityModulation(this.router.url)[0];

    this.AppService.getPermissions(modulo.id, modulo.type).subscribe( 
      response => {
        this.permission_read = response.data.r == 1 ? true : false;
        this.permission_create = response.data.w == 1 ? true : false;
        this.permission_update = response.data.u == 1 ? true : false;
        this.permission_delete = response.data.d == 1 ? true : false;
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );
  }

  public generarReporte() {
    if (this.fechaDesde && this.fechaHasta) {
    this.reporteService.reporteIngredienteVentas(this.fechaDesde,this.fechaHasta).subscribe(data => {
      this.listaIngredientes = data.sort((a:any, b:any) => b.existencia - a.existencia);
       this.listaIngredientesFiltrada = this.listaIngredientes;
    },error => {
      this.toastr.error(error.error.messages.error, 'Error',);
    }
  );
    } else {
      this.toastr.warning("Campos vacios", 'Advertencia',);

    }

  }

  public filtrar() {
    this.listaIngredientesFiltrada = this.listaIngredientes.filter((ingrediente: { nombre: string }) => {
      let filtroNombres = true;
      if (this.filtroNombres) {
        filtroNombres = ingrediente.nombre.toLowerCase().includes(this.filtroNombres.toLowerCase());
      }
      return filtroNombres;
    });
  }

}
