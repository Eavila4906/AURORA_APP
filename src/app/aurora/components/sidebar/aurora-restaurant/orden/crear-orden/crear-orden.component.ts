import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { OrdenService } from '../service/orden.service';
import { RecargarPaginaService } from 'src/app/shared/service/recargar-pagina.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-crear-orden',
  templateUrl: './crear-orden.component.html',
  styleUrls: ['./crear-orden.component.css']
})
export class CrearOrdenComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  cliente: String = "";
  fecha: String = "";
  numeroOrden: number = 1;
  //LISTA PARA ORDENES
  listaOrdenProductos: any[] = [];
  listaOrdenProductosIndi: any[] = [];
  listaOrdenTicketCocina: any[] = [];
  //VER COMENTARIOS
  infoComentarios: String = "";
  sumaGramajes: number = 0.0;

  constructor(
    private AppService: AppService,
    private router: Router,
    public ordenService: OrdenService,
    private toastr: ToastrService,
    private confirmationService: RecargarPaginaService) {
    this.listaOrdenProductos = ordenService.listaOrdenProductos
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
    
    this.confirmationService.confirmarEnPáginaSalir();
    this.mostrarNumOrden();
    this.fechaActual();
  }

  public fechaActual() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = currentDate.getFullYear();
    this.fecha = `${year}-${month}-${day}`;
  }

  public mostrarNumOrden() {
    this.ordenService.numeroOrden().subscribe(data => {
      this.numeroOrden = parseInt(data[0].numero_factura) + 1;
    });
  }

  public eliminarProducto(id: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        const indice = this.listaOrdenProductos.findIndex(elemento => elemento.id === id);
        if (indice !== -1) {
          this.listaOrdenProductos.splice(indice, 1);
        }
      }
    })
  }

  public crearOrden() {
    if (this.listaOrdenProductos.length != 0 && this.fecha && this.ordenService.tipoPedido) {
  
      let factura = {
        "fecha": this.fecha,
        "nombre_cliente": this.cliente,
        "total": this.calcularTotal().toFixed(2),
        "numero_factura": this.numeroOrden,
        "estado_factura": "E",
        "tipo_pedido": this.ordenService.tipoPedido,
        "num_orden": this.numeroOrden
      }
      this.listaOrdenProductos = this.agruparProductosPorIdYComentarios(this.listaOrdenProductos);
      this.transformarListaTicketCocina(this.listaOrdenProductos);
      const detalle = this.listaOrdenProductos.map((producto) => {
        return {
          factura: 0, // Puedes asignar un valor específico si es necesario
          cantidad: producto.cantidad,
          producto: producto.id,
          subtotal: parseFloat(producto.subtotal), // Asegúrate de que el subtotal sea un número
          comentarios: producto.comentarios || "",
          estado_producto: "E", // Puedes asignar un valor específico si es necesario
          descripcion: producto.nombre_producto,
          precio: producto.precio,
          otro: producto.otro || false,
          estado_otro: "E",
          cantidad_pagada: 0,
        };
      });
      const orden = {
        factura: factura,
        detalle: detalle,
      };
      const ticket = {
        factura: factura,
        detalle: this.listaOrdenTicketCocina,
      }
      console.log(orden)
      this.ordenService.crearOrden(orden).subscribe(
        response => {
          this.toastr.success('Se registró con éxito', 'Registrar');
          this.ticketCocina(ticket);
          this.mostrarNumOrden()
          this.limpiarOrden()
          this.listaOrdenProductos = this.ordenService.listaOrdenProductos

        }, error => {
          console.log(error)
          this.toastr.error("Error al registrar", 'Error',);
        });

    } else {
      this.transformarListaIndividual(this.listaOrdenProductos)
      this.toastr.error('Existen campos vacios', 'Orden',);
    }
  }

  agruparProductosPorIdYComentarios(listaOrdenProductos: any) {

    const summedProducts: any = [];
    listaOrdenProductos.forEach((product: any) => {
      const key = `${product.id}-${product.comentarios}-${product.nombre_producto}-${product.precio}`;
      const id = product.id;
      const cantidad = parseInt(product.cantidad);
      if (summedProducts[key]) {
        summedProducts[key].cantidad += cantidad;
        summedProducts[key].subtotal += cantidad * product.precio;
        summedProducts[key].gramaje += cantidad * product.gramaje;

      } else {
        summedProducts[key] = { ...product, cantidad, subtotal: cantidad * product.precio };
      }
    });

    return Object.values(summedProducts);
  }
  public limpiarOrden() {
    this.cliente = ""
    this.ordenService.tipoPedido = ""
    this.listaOrdenProductos = [];
    this.listaOrdenProductosIndi = [];
    this.ordenService.listaOrdenProductos = [];
  }

  public infComentarios(comentarios: string) {
    this.infoComentarios = comentarios;
  }

  public calcularTotal(): number {
    let total = 0;
    for (const producto of this.listaOrdenProductos) {
      total += parseFloat(producto.subtotal);
    }
    return total;
  }

  public transformarListaIndividual(productos: any) {
    this.listaOrdenProductosIndi = []
    for (const producto of productos) {
      for (let i = 0; i < producto.cantidad; i++) {
        const productoIndividual = {
          id: producto.id,
          categoria: producto.categoria,
          comentarios: producto.comentarios,
          gramaje: producto.gramaje,
          cantidad: 1,
          descripcion: producto.nombre_producto,
          precio: producto.precio,
          subtotal: producto.precio,
          otro: producto.otro,
        }
        this.listaOrdenProductosIndi.push(productoIndividual);
      }
    }

  }

  public transformarListaTicketCocina(productos: any) {
    this.listaOrdenTicketCocina = productos.filter((producto: any) => producto.categoria !== "ADICIONALES" );
    console.log(this.listaOrdenTicketCocina)
    this.sumaGramajes = this.listaOrdenTicketCocina.reduce((suma: any, producto: any) => suma + Number(producto.gramaje), 0);
  }

  public ticketCocina(orden: any) {
    const tipoPedidoTexto = orden.factura.tipo_pedido === 'S' ? 'Servirse' : 'Llevar';

    const items = orden.detalle.map((item: any) => ({
      columns: [
        { text: `${item.cantidad} x`, width: 20, style: 'detalles' },
        {
          stack: [
            { text: item.nombre_producto, width: 200, style: 'detalles' },
            item.comentarios
              ? { text: `* ${item.comentarios}`, fontSize: 10 }
              : null,  // Comentarios debajo de la descripción
          ]
        },
        //{ text: `${item.gramaje || 0} gr`, width: 50, style: 'detalles' },

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
        { text: `TICKET COCINA - #ORDEN ${orden.factura.num_orden} `, style: 'header', alignment: 'center' },
        '-------------------------------------',
        { text: `Cliente: ${orden.factura.nombre_cliente}`, style: 'factura' },
        { text: `Pedido: ${tipoPedidoTexto}`, style: 'factura' },
        '**************************',
        items,
        '**************************',
        { text: `Gramaje Total: ${this.sumaGramajes} gr`, style: 'header', alignment: 'right' },

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
