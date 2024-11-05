import { Component, OnInit } from '@angular/core';
import { OrdenService } from '../service/orden.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-detalles-orden',
  templateUrl: './detalles-orden.component.html',
  styleUrls: ['./detalles-orden.component.css']
})
export class DetallesOrdenComponent implements OnInit {
  prueba: number = 5;
  idfactura: any;
  cliente: string = "";
  fecha: string = "";
  numeroOrden: number = 0;
  update_at: string = "";
  listaOrdenProductos: any[] = [];
  deshabilitarBotones = false;
  selectedRows: any[] = [];
  listaOrdenTicketCocina: any[] = [];
  sumaGramajes: number = 0.0;
  cantidadP: number = 0;
  //VER COMENTARIOS
  infoComentarios: string = "";
  aggDividirCuentas: boolean = false;
  cantidadPagadaInicial: number = 0;
  //DELIVERY 
  montoDelivery: number = 0;
  comentariosDelivery: string = "";

  //PAGOS
  montoTotal: number = 0;
  montoPagar: number = 0;
  tipoPago: string = "";
  montoPagar2: number = 0;
  tipoPago2: string = "";

  //PAGOS SELECCIONADOS
  montoTotalA: number = 0;
  montoPagarA: number = 0;
  tipoPagoA: string = "";
  montoPagarA2: number = 0;
  tipoPagoA2: string = "";
  pagar: boolean = false;
  eliminar: boolean = false;

  verificarDelivery: any[] = [];
  constructor(
    public ordenService: OrdenService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.idfactura = this.route.snapshot.paramMap.get('id-factura');
    this.mostrarOrden();

    this.mostrarDetallesOrden();
    this.verificarRegistroDelivery();
  }

  public agruparProductosPorIdYComentarios(listaOrdenProductos: any) {
    const summedProducts: any = [];
    listaOrdenProductos.forEach((product: any) => {
      const key = `${product.id}-${product.comentarios}-${product.nombre_producto}-${product.precio}`;
      const id = product.id;
      const cantidad = parseInt(product.cantidad);
      console.log(cantidad)
      if (summedProducts[key]) {
        summedProducts[key].cantidad += cantidad;
        summedProducts[key].subtotal += cantidad * product.precio;
      } else {
        summedProducts[key] = { ...product, cantidad, subtotal: cantidad * product.precio };
      }
    });

    return Object.values(summedProducts);
  }

  public mostrarDetallesOrden() {
    this.listaOrdenProductos = []
    this.ordenService.listaOrdenProductosActu = [];
    this.ordenService.mostrarDetalleOrden(this.idfactura).subscribe(data => {
      this.listaOrdenProductos = this.ordenService.listaOrdenProductosActu;
      this.listaOrdenProductos.push(...data.sort((a: any, b: any) => parseFloat(b.precio) - parseFloat(a.precio)));
      for (const item of this.listaOrdenProductos) {
        item.selected = false;
        item.numero = 0 // Agregar el nuevo campo a cada objeto en la lista
        if (item.otro === '0') {
          item.otro = 'f';
      } else if (item.otro === '1') {
          item.otro = 't';
      }}
    });


  }

  public mostrarOrden() {
    this.ordenService.mostrarDatosOrden(this.idfactura).subscribe(data => {
      if (data[0]['estado_factura'] === "C") {
        this.router.navigate([`principal/orden/pendientes/`]);
        
      }
      this.numeroOrden = data[0]['numero_factura']
      this.cliente = data[0]['nombre_cliente']
      this.ordenService.tipoPedido = data[0]['tipo_pedido']
      this.ordenService.tipoPedidoAux = data[0]['tipo_pedido']
      this.fecha = data[0]['fecha']
      this.update_at = data[0]['update_at']
    });
  }

  public actualizarOrden() {
    if (this.verificarProductosNuevos()) {
      this.toastr.warning("No hay productos que guardar!", 'Advertencia',);
      return
    }
    if (this.listaOrdenProductos && this.fecha && this.ordenService.tipoPedido) {
      let factura = {
        "fecha": this.fecha,
        "nombre_cliente": this.cliente,
        "total": this.calcularTotal().toFixed(2),
        "numero_factura": this.numeroOrden,
        "tipo_pedido":this.ordenService.tipoPedido,

      }
      this.listaOrdenProductos = this.agruparProductosPorIdYComentarios(this.listaOrdenProductos)
      this.transformarListaTicketCocina(this.ordenService.listaOrdenProductosNuevos);

      const detalle = this.listaOrdenProductos.map((producto) => {
        return {
          factura: 0, // Puedes asignar un valor específico si es necesario
          cantidad: producto.cantidad,
          producto: producto.id,
          subtotal: parseFloat(producto.subtotal), // Asegúrate de que el subtotal sea un número
          comentarios: producto.comentarios || "",
          estado_producto: producto.estado_producto, // Puedes asignar un valor específico si es necesario
          descripcion: producto.nombre_producto,
          precio: producto.precio,
          otro: producto.otro || false,
          estado_otro: producto.estado_producto,
          cantidad_pagada: producto.cantidad_pagada || 0,
        };
      });
      console.log(detalle)
      const orden = {
        factura: factura,
        detalle: detalle,
      };
      const ticket = {
        factura: factura,
        detalle: this.listaOrdenTicketCocina,
      }
      console.log(detalle)
      this.ordenService.actualizarOrden(this.idfactura, orden).subscribe(
        response => {
          this.toastr.success('Se actualizó con éxito', 'Actualizar');
          if (this.listaOrdenTicketCocina.length != 0) {
            this.ticketCocina(ticket);
          }
          this.selectedRows = []
          this.deshabilitarBotones = false;
          this.ordenService.listaOrdenProductosActu = []
          this.ordenService.listaOrdenProductosNuevos = []
          this.mostrarOrden();
          this.mostrarDetallesOrden();
          this.eliminar = false;
        }, error => {
          console.log(error)
          this.toastr.error("Error al editar", 'Error',);
        });


    } else {
      this.toastr.error('Existen campos vacios', 'Orden',);
    }
  }

  public eliminarProducto(producto: any) {
    console.log(producto)
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        let indice;
        if (producto.otro == 't') {
          indice = this.listaOrdenProductos.findIndex(elemento => (elemento.nombre_producto === producto.nombre_producto));
        } else {
          indice = this.listaOrdenProductos.findIndex(elemento => (elemento.id === producto.id));
        }

        if (indice !== -1) {
          this.listaOrdenProductos.splice(indice, 1)
          console.log(this.listaOrdenProductos.length)
        }
        this.eliminar = true;
      }
    })
  }

  public calcularTotal(): number {
    let total = 0;
    for (const producto of this.listaOrdenProductos) {
      total += parseFloat(producto.subtotal);
    }
    return total;
  }

  public restanteTotal(): number {
    let total = 0;
    for (const producto of this.listaOrdenProductos) {
      if (producto.cantidad_pagada !== producto.cantidad) {
        let cantidad = producto.cantidad - producto.cantidad_pagada
        total += cantidad * parseFloat(producto.precio);
      }
    }

    return total;
  }


  public calcularTotalSelecc(): number {
    let total = 0;
    for (const producto of this.selectedRows) {
      total += producto.numero * parseFloat(producto.precio);
    }
    return parseFloat(total.toFixed(2));
  }

  public calcularDebe(): number {
    let total = 0;
    total = this.calcularTotal() - this.calcularTotalSelecc()
    return total;
  }


  public seleccionarFila(producto: any) {

    console.log(this.listaOrdenProductos)
    if (producto.selected) {
      producto.numero = 1
      // Agregar la fila seleccionada al arreglo
      this.selectedRows.push(producto);
    } else {
      producto.numero = 0
      // Eliminar la fila deseleccionada del arreglo
      const index = this.selectedRows.indexOf(producto);
      if (index !== -1) {
        this.selectedRows.splice(index, 1);
      }
    }
  }

  public infComentarios(comentarios: string) {
    this.infoComentarios = comentarios;
  }

  public checkboxChangedPago(event: any) {
    if (event.target.checked == true) {
      this.aggDividirCuentas = true;
    } else {
      this.limpiarPagoTotal()
    }
  }

  public limpiarPagoTotal() {
    this.aggDividirCuentas = false;
    this.montoPagar2 = 0;
    this.tipoPago2 = '';
    this.montoPagarA2 = 0;
    this.tipoPagoA2 = '';
  }

  public infoPago(monto: number) {

    if (!this.verificarProductosNuevos()) {
      this.toastr.warning("Se deben guardar los nuevos productos", 'Advertencia',);
      this.deshabilitarBotones = true;
    }

    this.aggDividirCuentas = false
    this.montoTotal = parseFloat(monto.toFixed(2));
    this.montoPagar = parseFloat(monto.toFixed(2));;
    this.limpiarPagoTotal();
  }

  public infoPagoA(monto: number) {
    if (!this.verificarProductosNuevos()) {
      this.toastr.warning("Se deben guardar los nuevos productos", 'Advertencia',);
      this.deshabilitarBotones = true;
    }
    this.aggDividirCuentas = false
    this.montoTotalA = monto;
    this.montoPagarA = monto;
    this.limpiarPagoTotal();

    if (this.selectedRows.length == 0) {
      this.pagar = true
    } else {
      this.pagar = false
      console.log(this.pagar)
    }
  }

  public pagarTotal() {
    if (this.montoPagar && this.tipoPago) {
      if (this.aggDividirCuentas) {
        if (this.montoPagar2.toString() == "0" || !this.tipoPago2) {
          this.toastr.error("Existen campos vacios", 'Error',);
          return
        }
      }
      const total = (this.montoPagar + this.montoPagar2).toFixed(2)
      if (parseFloat(total) == this.montoTotal) {
        let factura = {
          "estado_factura": "C",
        }
        let abono;
        if (this.aggDividirCuentas) {
          abono = [
            {
              "factura": "0",
              "valor": this.montoPagar,
              "tipo_pago": this.tipoPago,
            },
            {
              "factura": "0",
              "valor": this.montoPagar2,
              "tipo_pago": this.tipoPago2,
            },
          ]
        } else {
          abono = [
            {
              "factura": "0",
              "valor": this.montoPagar,
              "tipo_pago": this.tipoPago,
            },
          ]
        }
        const orden = {
          factura: factura,
          abono: abono,
        };
        if (this.ordenService.tipoPedido == 'L' && this.verificarDelivery.length == 0) {
          Swal.fire({
            title: '¿Deseas pagar la orden?',
            text: "¡La orden para llevar no tiene un pago delivery!",
            showCancelButton: true,
            confirmButtonText: 'Si',
            confirmButtonColor: '#d33',
          }).then((result) => {
            if (result.isConfirmed) {
              this.ordenService.pagoFactura(this.idfactura, orden).subscribe(
                response => {
                  this.toastr.success('Factura pagada', 'Pago');
                  this.mostrarOrden();
                  this.mostrarDetallesOrden();
                }, error => {
                  console.log(error)
                  this.toastr.error("Error al pagar", 'Error',);
                });
            }
          })
        } else {
          this.ordenService.pagoFactura(this.idfactura, orden).subscribe(
            response => {
              this.toastr.success('Factura pagada', 'Pago');
              this.mostrarOrden();
              this.mostrarDetallesOrden();
            }, error => {
              console.log(error)
              this.toastr.error("Error al pagar", 'Error',);
            });
        }
      } else {
        this.toastr.error("Verificar el monto digitado", 'Error',);
        return
      }
    } else {
      this.toastr.error("Existen campos vacios", 'Error',);
    }
  }

  public pagarTotalA() {
    if (this.montoPagarA && this.tipoPagoA) {
      if (this.aggDividirCuentas) {
        if (this.montoPagarA2.toString() == "0" || !this.tipoPagoA2) {
          this.toastr.error("Existen campos vacios", 'Error',);
          return
        }
      }
      const total = (this.montoPagarA + this.montoPagarA2).toFixed(2)
      if (parseFloat(total) == this.montoTotalA) {
        let abono;
        if (this.aggDividirCuentas) {
          abono = [
            {
              "factura": "0",
              "valor": this.montoPagarA,
              "tipo_pago": this.tipoPagoA,
            },
            {
              "factura": "0",
              "valor": this.montoPagarA2,
              "tipo_pago": this.tipoPagoA2,
            },
          ]
        } else {
          abono = [
            {
              "factura": "0",
              "valor": this.montoPagarA,
              "tipo_pago": this.tipoPagoA,
            },
          ]
        }
        const detalle = this.selectedRows.map((producto) => {
          return {
            id: producto.id_detalle_factura, // Puedes asignar un valor específico si es necesario
            otro: producto.otro || false,
            cantidad_pagada: parseInt(producto.numero) + parseInt(producto.cantidad_pagada)
          };
        });
        const orden = {
          abono: abono,
          detalle: detalle,
        };
        this.ordenService.pagoProductos(this.idfactura, orden).subscribe(
          response => {
            this.toastr.success('Productos pagados', 'Pago');
            this.selectedRows = []
            this.ordenService.listaOrdenProductosActu = []
            this.mostrarOrden();
            this.mostrarDetallesOrden();
          }, error => {
            console.log(error)
            this.toastr.error("Error al pagar", 'Error',);
          });


      } else {
        this.toastr.error("Verificar el monto digitado", 'Error',);
        return
      }
    } else {
      this.toastr.error("Existen campos vacios", 'Error',);
    }
  }

  public actualizarMontoPagar2() {
    const total = (this.montoTotal - this.montoPagar).toFixed(2)
    this.montoPagar2 = parseFloat(total)
    if (this.montoPagar2 < 0) {
      this.montoPagar2 = 0;
    }
  }

  public actualizarMontoPagarA2() {
    const total = (this.montoTotalA - this.montoPagarA).toFixed(2)
    this.montoPagarA2 = parseFloat(total)
    if (this.montoPagarA2 < 0) {
      this.montoPagarA2 = 0;
    }
  }

  public registrarDelivery() {
    if (this.montoDelivery) {
      this.ordenService.registrarDelivery(this.idfactura, this.montoDelivery.toString(), this.comentariosDelivery).subscribe(
        response => {
          this.toastr.success('Se registró con éxito', 'Delivery');
          this.comentariosDelivery = ""
          this.montoDelivery = 0
          this.verificarRegistroDelivery()
        },
        error => {
          this.toastr.error('Se eliminó con éxito', 'Error',);
        }
      );
    } else {
      this.toastr.error('Existen campos vacios', 'Error',);
    }
  }

  public verificarRegistroDelivery() {
    this.ordenService.mostrarDeliveryId(this.idfactura).subscribe(data => {
      this.verificarDelivery = data;
    });
  }

  public verificarProductosNuevos(): boolean {
    return this.ordenService.listaOrdenProductosNuevos.length == 0 && !this.eliminar

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
              : null,
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
        { text: `TICKET COCINA - #ORDEN ${orden.factura.numero_factura} `, style: 'header', alignment: 'center' },
        '-------------------------------------',
        { text: 'Nuevos Productos Añadidos', style: 'header', alignment: 'center' },
        '**************************',
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

  public ticketFactura(orden: any, total: string) {
    const tipoPedidoTexto = orden.factura.tipo_pedido === 'S' ? 'Servirse' : 'Llevar';
    const items = orden.detalle.map((item: any) => ({
      columns: [

        {
          stack: [
            { text: item.nombre_producto, width: 120, style: 'detalles' },
            item.comentarios
              ? { text: `* ${item.comentarios}`, fontSize: 10 }
              : null, // Comentarios debajo de la descripción
          ]
        },
        { text: `$${item.precio} `, width: 30, style: 'detalles' },
        { text: `x ${item.numero}`, width: 20, style: 'detalles', alignment: 'right' },

        { text: `$${(item.precio * item.numero).toFixed(2)}`, width: 40, style: 'detalles', alignment: 'right' },

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
        '*******************************************',
        { text: `DETALLES - #ORDEN ${orden.factura.numero_factura} `, style: 'header', alignment: 'center' },
        '*******************************************',
        {
          columns: [
            { text: `Cliente: ${orden.factura.nombre_cliente}`, style: 'factura' },
            { text: `P: ${tipoPedidoTexto}`, width: 70, style: 'factura' },

          ],
        },
        {
          text: `Fecha: ${orden.factura.update_at}`, style: 'factura'
        },
        '*******************************************',
        items,
        '*******************************************',
        { text: `Total: $${total} `, style: 'header', alignment: 'right' },

      ],
      styles: {
        header: { fontSize: 12, bold: true },
        factura: { fontSize: 11, margin: [0, 1, 0, 1] },
        detalles: { fontSize: 11, margin: [0, 1, 0, 1] },
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }
  public ticketFacturaTotal(orden: any, total: string) {
    const tipoPedidoTexto = orden.factura.tipo_pedido === 'S' ? 'Servirse' : 'Llevar';
    const items = orden.detalle.map((item: any) => ({
      columns: [

        {
          stack: [
            { text: item.nombre_producto, width: 120, style: 'detalles' },
            item.comentarios
              ? { text: `* ${item.comentarios}`, fontSize: 10 }
              : null, // Comentarios debajo de la descripción
          ]
        },
        { text: `$${item.precio} `, width: 30, style: 'detalles' },
        { text: `x ${item.cantidad - item.cantidad_pagada}`, width: 20, style: 'detalles', alignment: 'right' },

        { text: `$${(item.precio * (item.cantidad - item.cantidad_pagada)).toFixed(2)}`, width: 40, style: 'detalles', alignment: 'right' },

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
        '*******************************************',
        { text: `DETALLES - #ORDEN ${orden.factura.numero_factura} `, style: 'header', alignment: 'center' },
        '*******************************************',
        {
          columns: [
            { text: `Cliente: ${orden.factura.nombre_cliente}`, style: 'factura' },
            { text: `P: ${tipoPedidoTexto}`, width: 70, style: 'factura' },

          ],
        },
        {
          text: `Fecha: ${orden.factura.update_at}`, style: 'factura'
        },
        '*******************************************',
        items,
        '*******************************************',
        { text: `Total: $${total} `, style: 'header', alignment: 'right' },

      ],
      styles: {
        header: { fontSize: 12, bold: true },
        factura: { fontSize: 11, margin: [0, 1, 0, 1] },
        detalles: { fontSize: 11, margin: [0, 1, 0, 1] },
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }
  public comprobanteTotal() {
    let factura = {
      "fecha": this.fecha,
      "nombre_cliente": this.cliente,
      "total": this.calcularTotal().toFixed(2),
      "numero_factura": this.numeroOrden,
      "tipo_pedido": this.ordenService.tipoPedido,
      "update_at": this.update_at
    }
    const ticket = {
      factura: factura,
      detalle: this.listaOrdenProductos,
    }
    this.ticketFacturaTotal(ticket, this.restanteTotal().toFixed(2));

  }

  public comprobanteAbono() {
    let factura = {
      "fecha": this.fecha,
      "nombre_cliente": this.cliente,
      "total": this.calcularTotal().toFixed(2),
      "numero_factura": this.numeroOrden,
      "tipo_pedido": this.ordenService.tipoPedido,
      "update_at": this.update_at
    }
    const ticket = {
      factura: factura,
      detalle: this.selectedRows,
    }
    this.ticketFactura(ticket, this.calcularTotalSelecc().toFixed(2));
  }




}

