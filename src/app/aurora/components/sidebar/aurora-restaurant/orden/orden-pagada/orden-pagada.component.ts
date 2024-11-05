import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdenService } from '../service/orden.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AbonoService } from '../service/abono.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AppService } from 'src/app/services/app.service';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-orden-pagada',
  templateUrl: './orden-pagada.component.html',
  styleUrls: ['./orden-pagada.component.css']
})
export class OrdenPagadaComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  validarRol: boolean = false;

  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;
  idAbono: string = "";
  listaOrdenPagadas: any[] = [];
  listaOrdenPagadasFilt: any[] = [];
  listaDetallesProductos: any[] = [];
  filtroNombres: string = "";
  filtroTipoPedido: string = "";
  fechaDesde: string = "";
  fechaHasta: string = "";
  tipoPago: string = "";
  listaOrdenAbonos: any[] = [];
  constructor(
    private ordenService: OrdenService,
    private abonoService: AbonoService,
    private toastr: ToastrService,
    private AppService: AppService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fechaActual()
    this.mostrarOrdenPagadas()
  }

  public fechaActual() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = currentDate.getFullYear();
    this.fechaDesde = `${year}-${month}-${day}`;
    this.fechaHasta = `${year}-${month}-${day}`;
  }

  public mostrarOrdenPagadas() {
    this.ordenService.mostrarOrdenPagadas(this.fechaDesde, this.fechaHasta).subscribe(data => {
      this.listaOrdenPagadas = data.sort((a: any, b: any) => parseInt(b.numero_factura) - parseInt(a.numero_factura));
      this.listaOrdenPagadasFilt = this.listaOrdenPagadas;
    });
  }

  public mostrarAbonos(id_abono: string) {
    this.abonoService.mostrarAbonos(id_abono).subscribe(data => {
      this.listaOrdenAbonos = data.sort((a: any, b: any) => parseFloat(b.valor) - parseFloat(a.valor));
        this.idAbono= id_abono;
    });
  }

  public detallesOrden(orden: any) {
    if (this.permission_read) {
      const url = `principal/orden/pendientes/detalles/${orden.id_factura}`;
      window.open(url, '_blank');
    } else {
      this.toastr.warning('You do not have the necessary permissions to view this module.', 'Access denied!', { closeButton: true });
    }
  }

  public filtrar() {
    this.listaOrdenPagadasFilt = this.listaOrdenPagadas.filter((orden: { nombre_cliente: string, tipo_pedido: string }) => {
      let filtroTipoPedido = true;
      if (this.filtroTipoPedido) {
        console.log(filtroTipoPedido)
        filtroTipoPedido = orden.tipo_pedido === this.filtroTipoPedido;
      }
      let filtroNombres = true;
      if (this.filtroNombres) {
        filtroNombres = orden.nombre_cliente.toLowerCase().includes(this.filtroNombres.toLowerCase());
      }
      return filtroNombres && filtroTipoPedido;
    });
  }

  public eliminarOrden(idRegistro: string) {
    let factura = {
      "estado_factura": "E"
    }
    let orden = {
      factura: factura
    }
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordenService.eliminarOrdenPagada(idRegistro, orden).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarOrdenPagadas()
          },
          error => {
            this.toastr.error('Error al eliminar', 'Error',);
          }
        );
      }
    })
  }
  
  public mostrarDetallesOrden(orden:any) {
    this.ordenService.mostrarDetalleOrden(orden.id_factura).subscribe(data => {
      console.log(data)
      this.listaDetallesProductos = data.sort((a: any, b: any) => parseFloat(b.precio) - parseFloat(a.precio));
      let total = this.listaDetallesProductos.reduce((suma: any, producto: any) => suma + Number(producto.subtotal), 0);
      const ticket = {
        factura: orden,
        detalle: this.listaDetallesProductos,
      }
      this.ticketFacturaTotal(ticket, total)
    });
  }
  
  public cambiarTipoPago(orden: any) {
    let tipoPago;
    if (orden.tipo_pago == "E") {
      tipoPago= "T"
    } else if (orden.tipo_pago == "T") {
      tipoPago= "E"
    }
    let abono = {
      "tipo_pago": tipoPago
    }
    let abonos = {
      abono: abono
    }
    this.abonoService.cambiarTipoPago(orden.id_abono, abonos).subscribe(
      response => {
        this.toastr.success('Se cambio con éxito', 'Modificar');
        this.mostrarAbonos(this.idAbono);
      },
      error => {
        this.toastr.error('Error al cambiar', 'Error',);
      }
    );
  }

  public ticketFacturaTotal(orden: any, total: string) {
    const tipoPedidoTexto = orden.factura.tipo_pedido === 'S' ? 'Servirse' : 'Llevar';
    const items = orden.detalle.map((item: any) => ({
      columns: [

        {
          stack: [
            { text: item.nombre_producto, width: 120, style: 'detalles' },
            //item.comentarios
              //? { text: `* ${item.comentarios}`, fontSize: 10 }
              //: null, // Comentarios debajo de la descripción
          ]
        },
        { text: ` $${item.precio} `, width: 30, style: 'detalles' },
        { text: `x ${item.cantidad }`, width: 20, style: 'detalles', alignment: 'right' },

        { text: `$${(item.precio * item.cantidad).toFixed(2)}`, width: 40, style: 'detalles', alignment: 'right' },

      ],
      margin: [0, 2],
    }));

    const docDefinition: any = {
      pageSize: {
        width: 156,
        height: 'auto'
      },
      pageMargins: [10, 10, 10, 10], // Márgenes personalizados (izquierda, arriba, derecha, abajo)
      content: [
        '**************************',
        { text: `DETALLES - #ORDEN ${orden.factura.numero_factura} `, style: 'header', alignment: 'center' },
        '**************************',
        {
          columns: [
            { text: `Cliente: ${orden.factura.nombre_cliente}`, style: 'factura' },
            //{ text: `P: ${tipoPedidoTexto}`, width: 70, style: 'factura' },

          ],
        },
        {
          text: `Fecha: ${orden.factura.update_at}`, style: 'factura'
        },
        '**************************',
        items,
        '**************************',
        { text: `Total: $${total} `, style: 'header', alignment: 'right' },

      ],
      styles: {
        header: { fontSize: 9, bold: true },
        factura: { fontSize: 10, margin: [0, 1, 0, 1] },
        detalles: { fontSize: 10, margin: [0, 1, 0, 1] },
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }
}
