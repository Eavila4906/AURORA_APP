import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdenService } from '../service/orden.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AppService } from 'src/app/services/app.service';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-orden-pendiente',
  templateUrl: './orden-pendiente.component.html',
  styleUrls: ['./orden-pendiente.component.css']
})
export class OrdenPendienteComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;
  
  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;
  listaOrdenPendientes: any[] = [];
  listaOrdenPendientesFilt: any[] = [];
  listaDetallesProductos: any[] = [];
  listaOrdenTicketCocina: any[] = [];
  filtroNombres: string = "";
  filtroTipoPedido: string = "";
  fechaDesde: string = "";
  fechaHasta: string = "";
  
  constructor(
    private AppService: AppService,
    private router: Router,
    private ordenService: OrdenService,
    private toastr: ToastrService
  ) {

  }

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
    this.mostrarOrdenPendientes()
  }

  public fechaActual() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = currentDate.getFullYear();
    this.fechaDesde = `${year}-${month}-${day}`;
    this.fechaHasta = `${year}-${month}-${day}`;
  }

  public mostrarOrdenPendientes() {
    this.ordenService.mostrarOrdenPendientes(this.fechaDesde, this.fechaHasta).subscribe(data => {
      this.listaOrdenPendientes = data.sort((a: any, b: any) => parseFloat(b.numero_factura) - parseFloat(a.numero_factura));
      this.listaOrdenPendientesFilt = this.listaOrdenPendientes;
    });
  }

  public mostrarDetallesOrden(orden:any) {
    this.ordenService.mostrarDetalleOrden(orden.id_factura).subscribe(data => {
      console.log(data)
      this.listaDetallesProductos = data.sort((a: any, b: any) => parseFloat(b.precio) - parseFloat(a.precio));
      this.listaOrdenTicketCocina = this.listaDetallesProductos.filter((producto: any) => producto.categoria !== "ADICIONALES" );
      let sumaGramajes = this.listaOrdenTicketCocina.reduce((suma: any, producto: any) => suma + Number(producto.gramaje*producto.cantidad), 0);
      const ticket = {
        factura: orden,
        detalle: this.listaOrdenTicketCocina,
      }
      this.ticketCocina(ticket, sumaGramajes)
    });
  }
  
  public detallesOrden(orden: any) {
    this.router.navigate([`/ordenes/pendientes/detalles/${orden.id_factura}`]);
    //const url = `principal/estudiantes/datos-adicionales/${idgrupo}/${idEstudiante}`;
    //const url = `principal/orden/pendientes/detalles/${orden.id_factura}`;
    //window.open(url, '_blank');
  }

  public filtrar() {
    this.listaOrdenPendientesFilt = this.listaOrdenPendientes.filter((orden: { nombre_cliente: string, tipo_pedido: string }) => {
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

  public eliminarOrden(idRegistro: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordenService.eliminarOrden(idRegistro).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarOrdenPendientes()
          },
          error => {
            console.log(error)
            this.toastr.error(error.error.messages, 'Error',);
          }
        );
      }
    })
  }

  public ticketCocina(orden: any,gramaje:string) {
    const tipoPedidoTexto = orden.factura.tipo_pedido === 'S' ? 'Servirse' : 'Llevar';
    const items = orden.detalle.map((item: any) => ({
      columns: [
        { text: `${item.cantidad} x`, width: 20, style: 'detalles' },
        {
          stack: [
            { text: item.nombre_producto, width: 200, style: 'detalles' },
            item.comentarios
              ? { text: `* ${item.comentarios}`, fontSize: 10 }
              : null, // Comentarios debajo de la descripción
          ]
        },
        //{ text: `${item.gramaje *item.cantidad|| '0'} gr`, width: 50, style: 'detalles' },

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
        { text: `TICKET COCINA - #ORDEN ${orden.factura.numero_factura} `, style: 'header', alignment: 'center' },
        '-------------------------------------',
        { text: 'Reimpresion de Orden',  style: 'header', alignment: 'center' },
        '**************************',
        { text: `Cliente: ${orden.factura.nombre_cliente}`, style: 'factura' },
        { text: `Pedido: ${tipoPedidoTexto}`, style: 'factura' },
        '**************************',
        items,
        '**************************',
        { text: `Gramaje Total: ${gramaje || '0'} gr`, style: 'header', alignment: 'right' },

      ],
      styles: {
        header: { fontSize: 12, bold: true },
        factura: { fontSize: 12, margin: [0, 1, 0, 1] },
        detalles: { fontSize: 14, margin: [0, 1, 0, 1] },
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }
}
