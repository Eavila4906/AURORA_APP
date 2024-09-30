import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../categorias/service/categoria.service';
import { ProductoService } from '../../productos/service/producto.service';
import { ToastrService } from 'ngx-toastr';
import { SalsasService } from '../../productos/service/salsas.service';
import { OrdenService } from '../service/orden.service';
import { Router } from '@angular/router';
declare var swiperCategoria: any

@Component({
  selector: 'app-slide-productos',
  templateUrl: './slide-productos.component.html',
  styleUrls: ['./slide-productos.component.css']
})
export class SlideProductosComponent implements OnInit {
  categoriaSeleccionada: string | null = null;
  baseUrlImange = "https://ananthous-tumble.000webhostapp.com/ChimekYoon/public/assets/productos"
  listaCategorias: any = null;
  listaCategoriasSinAdicional: any = null;
  listaProductosAdicional: any = null;
  listaProductos: any = null;
  listaProductosFiltrados: any[] = [];
  listaSalsas: any = null;
  //Variables para crear Orden
  infoProducto: any[] = [];
  idProducto: string = "";
  nombreP: string = "";
  descripcionP: string = "";
  //Precio que puede tomar del pvp1 o pvp2, tiene que ser casteado a number
  precio_ventaPO: string = "";
  prueba : string = "";
  precio_ventaP: number = 0;
  precio_ventaP2: number = 0;
  cantidadP: number = 0;
  subtotalP: number = 0;
  comentariosP: string = "";
  adicionalesP: string = "";
  gramajePapasP: number = 0;
  categoriaP: string = "";
  imagen: string = "";
  //VARIABLES PARA CATEGORIA OTROS
  nombreOtros: string = "";
  precio_ventaOtros: any;
  cantidadOtros: number = 1;

  //ADICIONALES
  aggAdicional: boolean = false;
  opcionesSeleccionadas: number[] = [];
  cantidadAdicionalesMap: Map<number, number> = new Map<number, number>();
  categoriaAdicionalMap: Map<number, string> = new Map<number, string>();
  precio_ventaAdicionalMap: Map<number, number> = new Map<number, number>();
  nombreAdicionalMap: Map<number, string> = new Map<number, string>();
  subtotalAdicionalMap: Map<number, number> = new Map<number, number>();
  //SALSAS
  salsas: boolean = false;
  salsasSeleccionadas: number[] = [];
  cantidadSalsaMap: Map<number, number> = new Map<number, number>();
  nombreSalsaMap: Map<number, string> = new Map<number, string>();
  numerAlitas: number = 0
  numerAlitasSeleccionada: number = 0

  tipoPedido: String = ''

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private salsaService: SalsasService,
    public ordenService: OrdenService,
    private router: Router,
    private toastr: ToastrService) {
    this.tipoPedido = ordenService.tipoPedido
  }

  ngOnInit(): void {
    swiperCategoria();
    this.mostrarCategorias();
    this.mostrarProductos();
    this.mostrarSalsas();
  }

  public mostrarCategorias() {
    this.categoriaService.mostrar().subscribe(data => {
      this.listaCategorias = data;
      this.listaCategoriasSinAdicional = this.listaCategorias.filter((categoria: any) => categoria.nombre !== 'ADICIONALES');
    });
  }

  public mostrarProductos() {
    this.productoService.mostrar().subscribe(data => {
      this.listaProductos = data.filter((producto: any) => producto.estatus !== 'Off');
      this.listaProductosAdicional = this.listaProductos.filter((producto: any) => producto.categoria === 'ADICIONALES');
    });
  }

  public alternarProductos(categoria: string) {
    if (this.categoriaSeleccionada === categoria) {
      this.categoriaSeleccionada = null; // Deselecciona la categoría si ya está seleccionada
      this.listaProductosFiltrados = [];
    } else {
      this.categoriaSeleccionada = categoria;
      this.listaProductosFiltrados = this.listaProductos.filter((producto: any) => producto.categoria === categoria);
    }
  }

  public infoProductos(producto: any) {
    this.limpiar()
    this.limpiarSalsas()
    this.idProducto = producto.id_producto
    this.nombreP = producto.nombre
    this.descripcionP = producto.descripcion
    this.precio_ventaP = producto.precio_venta
    this.precio_ventaP2 = producto.precio_venta2
    this.cantidadP = 1
    if (this.ordenService.tipoPedido =='S') {
      this.subtotalP = producto.precio_venta;
      this.precio_ventaPO = producto.precio_venta;
    } else {
      this.subtotalP = producto.precio_venta2;
      this.precio_ventaPO = producto.precio_venta2;

    }
    this.adicionalesP = producto.adicionales
    this.gramajePapasP = producto.gramaje
    this.categoriaP = producto.categoria
    this.imagen = producto.imagen;
    this.alitasSalsas()
  }

  public limpiar() {
    this.opcionesSeleccionadas = []
    this.precio_ventaAdicionalMap = new Map<number, number>();
    this.nombreAdicionalMap = new Map<number, string>();
    this.cantidadAdicionalesMap = new Map<number, number>();
    this.categoriaAdicionalMap = new Map<number, string>();
    this.subtotalAdicionalMap = new Map<number, number>();
    this.aggAdicional = false;
    this.comentariosP = ""
    this.numerAlitas = 0;
    this.numerAlitasSeleccionada = 0;
  }

  public limpiarSalsas() {
    this.salsasSeleccionadas = []
    this.cantidadSalsaMap = new Map<number, number>();
    this.salsas = false
  }

  public agregrarProductosOtros() {
    const productoOrdenOtros = {
      nombre_producto: this.nombreOtros,
      precio: this.precio_ventaOtros,
      cantidad: this.cantidadOtros,
      estado_producto: "E",
      gramaje: 0,
      numero: 0,
      cantidad_pagada: 0,
      subtotal: parseFloat((this.precio_ventaOtros * this.cantidadOtros).toFixed(2)),
      otro: 't'
    }
    console.log(productoOrdenOtros)
    if (this.router.url == '/principal/orden/crear') {
      this.ordenService.listaOrdenProductos.push(productoOrdenOtros);
    } else {
      this.ordenService.listaOrdenProductosNuevos.push(productoOrdenOtros);
      this.ordenService.listaOrdenProductosActu.push(productoOrdenOtros);
    }
    this.nombreOtros = "";
    this.precio_ventaOtros = "";
    this.cantidadOtros = 1;
  }

  public checkboxChanged(event: any) {
    if (event.target.checked == true) {
      this.aggAdicional = true;
    } else {
      this.limpiar()
    }
  }

  public checkboxChangedSalsas(event: any) {
    if (event.target.checked == true) {
      this.salsas = true;
      this.alitasSalsas()
    } else {
      this.limpiarSalsas()
      this.numerAlitasSeleccionada = 0;
    }
  }

  public alitasSalsas() {
    if (this.categoriaSeleccionada == "ALITAS") {
      const match = this.nombreP.match(/\d+/);
      if (match) {
        this.numerAlitas = parseInt(match[0], 10);
      }
    } else {
      const partes = this.descripcionP.split('+');
      const match = /\d/.test(partes[0].trim());
      if (match) {
        const numeroEncontrado = partes[0].trim();
        this.numerAlitas = parseInt(numeroEncontrado);
      } else {
        this.numerAlitas = 2;
      }
    }

  }

  public salsaSeleccionado(salsa: any, event: any) {
    const idSalsas = salsa.id_salsas;
    if (event.target.checked) {
      this.salsasSeleccionadas.push(idSalsas);
      this.cantidadSalsaMap.set(idSalsas, this.numerAlitas)
      this.nombreSalsaMap.set(idSalsas, salsa.nombre)
      this.salsasAlitas(idSalsas)
      this.calcularSumaCantidades()
    } else {
      const index = this.salsasSeleccionadas.indexOf(idSalsas);
      if (index !== -1) {
        this.salsasSeleccionadas.splice(index, 1);
        this.cantidadSalsaMap.delete(idSalsas);
      }
      this.salsasAlitas(idSalsas)
      this.calcularSumaCantidades()
    }
  }

  public salsasAlitas(idProducto: number) {
    let alitaSalsas = Math.floor(this.numerAlitas / this.salsasSeleccionadas.length);
    let alitasRestantes = this.numerAlitas % this.salsasSeleccionadas.length;
    this.cantidadSalsaMap.forEach((value, key) => {
      if (alitasRestantes > 0) {
        this.cantidadSalsaMap.set(key, alitaSalsas + 1);
        alitasRestantes--;
      } else {
        this.cantidadSalsaMap.set(key, alitaSalsas);
      }
    });
  }

  public calcularSumaCantidades() {
    let suma = 0;
    this.numerAlitasSeleccionada = 0
    for (const valor of this.cantidadSalsaMap.values()) {
      suma += valor;
    }
    this.numerAlitasSeleccionada = suma
  }

  public disminuirAlitasSalsa(salsa: any) {
    const idSalsas = salsa.id_salsas;
    const cantidadSeleccionada = this.cantidadSalsaMap.get(idSalsas) || 0;
    if (cantidadSeleccionada > 1) {
      this.cantidadSalsaMap.set(idSalsas, cantidadSeleccionada - 1);
    }
    this.calcularSumaCantidades();
  }

  public incrementarAlitasSalsa(salsa: any) {
    if ((this.categoriaSeleccionada == "ALITAS" || this.nombreP == "Combo #1") && this.numerAlitasSeleccionada >= this.numerAlitas) {
      this.toastr.error('No se puede superar las ' + this.numerAlitas, 'Alitas',);
    } else {
      const idSalsas = salsa.id_salsas;
      const cantidadSeleccionada = this.cantidadSalsaMap.get(idSalsas) || 0;
      this.cantidadSalsaMap.set(idSalsas, cantidadSeleccionada + 1);

    }
    this.calcularSumaCantidades();
  }

  public disminuirAdicionales(adicional: any) {
    const idProducto = adicional.id_producto;
    const cantidadSeleccionada = this.cantidadAdicionalesMap.get(idProducto) || 0;
    if (cantidadSeleccionada > 1) {
      this.cantidadAdicionalesMap.set(idProducto, cantidadSeleccionada - 1);
      this.calcularSubtotal(adicional);
    }
  }

  public incrementarAdicionales(adicional: any) {
    const idProducto = adicional.id_producto;
    const cantidadSeleccionada = this.cantidadAdicionalesMap.get(idProducto) || 0;
    this.cantidadAdicionalesMap.set(idProducto, cantidadSeleccionada + 1);
    this.calcularSubtotal(adicional);
  }

  public productoSeleccionado(adicional: any, event: any) {
    const idProducto = adicional.id_producto;
    if (event.target.checked) {
      this.opcionesSeleccionadas.push(idProducto);
      this.cantidadAdicionalesMap.set(idProducto, 1);
      this.subtotalAdicionalMap.set(idProducto, adicional.precio_venta)
      this.precio_ventaAdicionalMap.set(idProducto, adicional.precio_venta)
      this.nombreAdicionalMap.set(idProducto, adicional.nombre)
    } else {
      const index = this.opcionesSeleccionadas.indexOf(idProducto);
      if (index !== -1) {
        this.opcionesSeleccionadas.splice(index, 1);
        this.cantidadAdicionalesMap.delete(idProducto);
      }
    }
  }

  public calcularSubtotal(adicional: any) {
    const idProducto = adicional.id_producto;
    const cantidadSeleccionada = this.cantidadAdicionalesMap.get(idProducto) || 0;
    const precioVenta = adicional.precio_venta;
    const subtotal = (precioVenta * cantidadSeleccionada).toFixed(2);
    this.subtotalAdicionalMap.set(idProducto, parseFloat(subtotal));
  }

  public disminuir() {
    if (this.cantidadP > 1) {
      this.cantidadP--;
      this.subtotalP = Number(this.precio_ventaPO);
      this.subtotalP = parseFloat((this.subtotalP * this.cantidadP).toFixed(2))
    }
  }

  public incrementar() {
    this.cantidadP++;
    console.log(this.precio_ventaPO)
    this.subtotalP = Number(this.precio_ventaPO)
    this.subtotalP = parseFloat((this.subtotalP * this.cantidadP).toFixed(2))
  }

  public agregarProductos() {
    const productoOrden = {
      id: this.idProducto,
      nombre_producto: this.nombreP,
      precio: Number(this.precio_ventaPO),
      cantidad: this.cantidadP,
      subtotal: this.subtotalP,
      estado_producto: "E",
      comentarios: this.comentariosP,
      numero: 0,
      cantidad_pagada: 0,
      gramaje: this.gramajePapasP * this.cantidadP,
      categoria: this.categoriaP,
      otro: 'f'
    }
    if (this.salsasModal()) {
      if (!this.salsas) {
        this.toastr.error('Debe seleccionar las salsas ', 'Salsas');
        return
      }
      if (this.categoriaSeleccionada == "ALITAS" || this.nombreP == "Combo #1") {
        if (this.numerAlitasSeleccionada !== this.numerAlitas) {
          this.toastr.error('Faltan seleccionar ', 'Salsas');
          return
        }
      } else {
        if (this.numerAlitasSeleccionada == 0) {
          this.toastr.error('Faltan seleccionar ', 'Salsas');
          return
        }
      }

      const listaSalsas: { nombre: string, cantidad: number }[] = [];
      for (const [id, cantidad] of this.cantidadSalsaMap.entries()) {
        const nombre = this.nombreSalsaMap.get(id) || "";
        listaSalsas.push({ nombre: nombre, cantidad: cantidad });
      }
      for (const item of listaSalsas) {
        this.comentariosP += ` | ${item.nombre}: ${item.cantidad}`;
      }
      productoOrden.comentarios = this.comentariosP
    }

    if (this.aggAdicional) {
      const listaAdacionales: { id: number, nombre_producto: string, categoria: string, precio: number, cantidad: number, subtotal: number, estado_producto: string, comentarios: string, numero: number, cantidad_pagada: number, otro: boolean }[] = [];
      for (const [id, cantidad] of this.cantidadAdicionalesMap.entries()) {
        const precio = this.precio_ventaAdicionalMap.get(id) || 0;
        const nombre = this.nombreAdicionalMap.get(id) || "";
        const subtotal = this.subtotalAdicionalMap.get(id) || 0;
        listaAdacionales.push({ id: id, nombre_producto: nombre, categoria: 'ADICIONALES', precio: precio, cantidad: cantidad, subtotal: subtotal, estado_producto: 'E', comentarios: "", numero: 0, cantidad_pagada: 0, otro: false });
      }
      for (const item of listaAdacionales) {
        this.comentariosP += ` | ${item.nombre_producto}: ${item.cantidad}`;
      }
      productoOrden.comentarios = this.comentariosP
      if (this.router.url == '/principal/orden/crear') {
        this.ordenService.listaOrdenProductos.push(...listaAdacionales);

      } else {
        this.ordenService.listaOrdenProductosActu.push(...listaAdacionales);
        this.ordenService.listaOrdenProductosNuevos.push(...listaAdacionales);
        console.log(this.ordenService.listaOrdenProductosNuevos)

      }
    }
    if (this.router.url == '/principal/orden/crear') {
      this.ordenService.listaOrdenProductos.push(productoOrden);
    } else {
      this.ordenService.listaOrdenProductosActu.push(productoOrden);
      this.ordenService.listaOrdenProductosNuevos.push(productoOrden);
      console.log(this.ordenService.listaOrdenProductosNuevos)

    }

  }
  public mostrarSalsas() {
    this.salsaService.mostrar().subscribe(data => {
      this.listaSalsas = data;
    });
  }

  public salsasModal(): boolean {
    return this.categoriaSeleccionada == "ALITAS" ||
      this.nombreP == "Combo #1" ||
      this.nombreP == "Combo #2" ||
      this.nombreP === "Combo junior" ||
      this.nombreP == "Dakanjeong" ||
      this.nombreP == "Pop corn Pequeño" ||
      this.nombreP == "Pop corn Mediano"
  }

  //Captura el cambio de selected del preci0
  onChange(event: any) {
    this.cantidadP = 1;
    this.subtotalP = Number(this.precio_ventaPO)
}
}
