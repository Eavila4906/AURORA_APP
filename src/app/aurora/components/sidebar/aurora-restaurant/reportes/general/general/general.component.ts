import { Component, OnInit } from '@angular/core';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ReportesService } from '../../service/reportes.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;
  
  fechaDesde: string = "";
  fechaHasta: string = "";
  tipoReporte: string = "0";
  validarRol:boolean= false;
  constructor(
    private reporteService: ReportesService, 
    private toastr: ToastrService, 
    private AppService: AppService,
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
      },
      error => {
        console.error('Error al obtener datos de la API:', error);
      }
    );

    this.fechaActual()
  }

  public fechaActual() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = currentDate.getFullYear();
    this.fechaDesde = `${year}-${month}-${day}`;
    this.fechaHasta = `${year}-${month}-${day}`;
  }

  public generarReporte() {
    if (this.tipoReporte !='0' &&  this.fechaDesde && this.fechaHasta) {
      if(this.tipoReporte == '1'){
        this.reporteService.reporteVentas(this.fechaDesde, this.fechaHasta).subscribe(
          data => {
          let totalMonto = data.reduce((suma: any, orden: any) => suma + Number(orden.monto), 0);
          let totalEfectivo = data.reduce((suma: any, orden: any) => suma + Number(orden.efectivo), 0);
          let totalTransferencia = data.reduce((suma: any, orden: any) => suma + Number(orden.transferencia), 0);
          let totalDelivery = data.reduce((suma: any, orden: any) => suma + Number(orden.delivery), 0);
          console.log(data)
          const ticket = {
            ventas: data
          }
          this.ticketReportes(ticket, totalMonto, totalEfectivo, totalTransferencia, totalDelivery)
        },error => {
          this.toastr.error('No hay informacion disponible', 'Reporte',);
        }
        );
      }
      if(this.tipoReporte == '2'){
        this.reporteService.reporteVentasPedidosYa(this.fechaDesde, this.fechaHasta).subscribe(
          data => {
          let totalMonto = data.reduce((suma: any, orden: any) => suma + Number(orden.monto), 0);
          let totalEfectivo = data.reduce((suma: any, orden: any) => suma + Number(orden.efectivo), 0);
          let totalTransferencia = data.reduce((suma: any, orden: any) => suma + Number(orden.transferencia), 0);
          let totalDelivery = data.reduce((suma: any, orden: any) => suma + Number(orden.delivery), 0);
          console.log(data)
          const ticket = {
            ventas: data
          }
          this.ticketReportes(ticket, totalMonto, totalEfectivo, totalTransferencia, totalDelivery)
        },error => {
          this.toastr.error('No hay informacion disponible', 'Reporte',);
        }
        );
      }
     
    } else {
      this.toastr.warning("Campos vacios", 'Advertencia',);

    }

  }

  public ticketReportes(orden: any, totalMonto: number, totalEfectivo: number, totalTransferencia: number, totalDelivery: number,) {
    const columnTitles = ['#Orden', 'Monto', 'Efectivo', 'Transf', 'Delivery'];

    const data = orden.ventas.map((item: any) => [
      item.numero_de_orden,
      `$${item.monto || "-"}`,
      `$${item.efectivo || "-"}`,
      `$${item.transferencia || "-"}`,
      `$${item.delivery || "-"}`,
    ]);

    const table = {
      headerRows: 1,
      widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
      body: [
        columnTitles,
        ...data,
      ],
    }

    const footer = {
      columns: [
        { text: 'Total', width: 40, alignment: 'left', style: 'header' },
        { text: ` $${totalMonto.toFixed(2)}`, width: 50, alignment: 'center', style: 'header' },
        { text: ` $${totalEfectivo.toFixed(2)}`, width: 65, alignment: 'center', style: 'header' },
        { text: `$${totalTransferencia.toFixed(2)}`, width: 50, alignment: 'center', style: 'header' },
        { text: `$${totalDelivery.toFixed(2)}`, width: 50, alignment: 'center', style: 'header' },
      ],
      alignment: 'center',
    };
    const docDefinition: any = {
      pageSize: {
        width: 300,
        height: "auto"
      },
      pageMargins: [10, 10, 10, 10], // Márgenes personalizados (izquierda, arriba, derecha, abajo)
      content: [
        '******************************************************',
        { text: `VENTAS`, style: 'header', alignment: 'center' },
        '---------------------------------------------------------------------------',
        { text: `Fecha: ${this.fechaDesde} - ${this.fechaHasta}`, style: 'factura', alignment: 'center' },
        '******************************************************',
        {
          table: table,
          layout: 'lightHorizontalLines',
        },
        footer

      ],
      styles: {
        header: { fontSize: 12, bold: true },
        factura: { fontSize: 12, margin: [0, 1, 0, 1] },
        detalles: { fontSize: 12, margin: [0, 1, 0, 1] },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }
}

