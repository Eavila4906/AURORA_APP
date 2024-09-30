import { Component, OnInit } from '@angular/core';
import { OrdenService } from '../orden/service/orden.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {
  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;
  filtroNombres: string = "";
  listaDeliveries: any = null;
  listaDeliveriesFiltrada: any = null;
  fechaDesde: string = "";
  fechaHasta: string = "";

  constructor(
    private ordenService: OrdenService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.fechaActual();
    this.mostrarDeliveries();
  }

  public mostrarDeliveries() {
    this.ordenService.mostrarDelivery(this.fechaDesde, this.fechaHasta).subscribe(data => {
      this.listaDeliveries = data;
      this.listaDeliveriesFiltrada = this.listaDeliveries;
    });
  }

  public fechaActual() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = currentDate.getFullYear();
    this.fechaDesde = `${year}-${month}-${day}`;
    this.fechaHasta = `${year}-${month}-${day}`;
  }


  public filtrar() {
    this.listaDeliveriesFiltrada = this.listaDeliveries.filter((delivery: { factura: string }) => {
      let filtroNombres = true;
      if (this.filtroNombres) {
        filtroNombres = delivery.factura.toLowerCase().includes(this.filtroNombres.toLowerCase());
      }
      return filtroNombres;
    });
  }

  public eliminarDelivery(idRegistro: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordenService.eliminarDelivery(idRegistro).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarDeliveries();
          },
          error => {
            this.toastr.error('Error al eliminar', 'Error',);
          }
        );
      }
    })

  }

}
