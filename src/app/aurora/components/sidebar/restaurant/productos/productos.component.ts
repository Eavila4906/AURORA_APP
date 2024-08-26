import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../categorias/service/categoria.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from './service/producto.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { IngredientesService } from '../ingredientes/service/ingredientes.service';
import { RecetasService } from '../ingredientes/service/recetas/recetas.service';
import { data } from 'jquery';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;
  
  //Variables para paginacion
  paginaActual = 1;
  paginaActualIng = 1
  registrosPorPagina = 10;
  registrosPorPaginaIngr = 4;

  filtroNombres: string = "";
  filtroNombresIngrediente: string = "";
  filtroCategorias: string = "0";
  filtrolistaCategorias: string[] = []
  listaCategorias: any = null;
  listaProductos: any = null;
  listaProductosFiltrada: any = null;
  listaIngredientesBusquedad: any = null;
  listaIngredientesFiltradaBusquedad: any = null;
  listaIngredientes: { ingrediente_id: string; nombre_ingrediente: string, cantidad: 0 }[] = [];
  editarModal = false;
  imagen: any = null;
  nombreImagen: string = '';
  idProducto: string = "";
  nombreProducto: string = "";
  nombreIngrediente: string = '';
  cantidadIngrediente: number = 0;
  crearOrEditarReceta: boolean = false;

  productosForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    categoria: new FormControl('', Validators.required),
    estatus: new FormControl('On', Validators.required),
    precio_compra: new FormControl('', Validators.required),
    precio_venta2: new FormControl('', Validators.required),
    precio_venta: new FormControl('', Validators.required),
    margen: new FormControl({ value: '', disabled: true }, Validators.required),
    gramaje: new FormControl(''),
    adicionales: new FormControl('N', Validators.required),
    descripcion: new FormControl(''),
    imagen: new FormControl(null),
  });

 

  constructor(
    private AppService: AppService,
    private router: Router,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private ingredienteService: IngredientesService,
    private recetaService: RecetasService,
    private toastr: ToastrService
  ) {
    // Suscripción a los cambios en precio_compra y precio_venta
    this.productosForm.get('precio_compra')?.valueChanges.subscribe(() => this.calcularMargen());
    this.productosForm.get('precio_venta')?.valueChanges.subscribe(() => this.calcularMargen());
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

    this.mostrarCategorias()
    this.mostrarProductos()
    this.mostrarIngredientes()
  }

  public mostrarCategorias() {
    this.categoriaService.mostrar().subscribe(data => {
      this.listaCategorias = data;
    });
  }

  public mostrarProductos() {
    this.productoService.mostrar().subscribe(data => {
      this.listaProductos = data;
      this.listaProductosFiltrada = this.listaProductos;
      this.listaProductosFiltrada.sort((a: any, b: any) => {
        // Utiliza a.nombre y b.nombre para comparar los nombres
        const nombreA = a.categoria.toUpperCase();
        const nombreB = b.categoria.toUpperCase();
        if (nombreA < nombreB) {
          return -1;
        }
        if (nombreA > nombreB) {
          return 1;
        }
        return 0; // Si los nombres son iguales
      });
      this.filtrolistaCategorias = this.obtenerCategorias(data)
    });
  }

  public registrarProductos() {
    let nombre = this.productosForm.get('nombre')!.value ?? ''
    let categoria = this.productosForm.get('categoria')!.value ?? ''
    let estatus = this.productosForm.get('estatus')!.value ?? ''
    let precio_compra = this.productosForm.get('precio_compra')!.value ?? ''
    let precio_venta = this.productosForm.get('precio_venta')!.value ?? ''
    let precio_venta2 = this.productosForm.get('precio_venta2')!.value ?? ''
    let margen = this.productosForm.get('margen')!.value ?? ''
    let gramaje = this.productosForm.get('gramaje')!.value ?? ''

    let adicionales = this.productosForm.get('adicionales')!.value ?? ''
    let descripcion = this.productosForm.get('descripcion')!.value ?? ''
    if (this.productosForm.valid) {
      this.productoService.registrar(nombre, categoria, estatus, precio_compra, precio_venta, precio_venta2, margen,  adicionales, descripcion, this.imagen).subscribe(
        response => {
          this.toastr.success('Se registró con éxito', 'Registrar');
          this.productosForm.reset();
          this.mostrarProductos();
        }, error => {
          console.log(error)
          this.toastr.error('Existen errores al guardar', 'Error',);
        }
      );
    } else {
      this.toastr.error("Formulario con errores", 'Error');
    }
  }

  public actualizarProductos() {
    let nombre = this.productosForm.get('nombre')!.value ?? ''
    let categoria = this.productosForm.get('categoria')!.value ?? ''
    let estatus = this.productosForm.get('estatus')!.value ?? ''
    let precio_compra = this.productosForm.get('precio_compra')!.value ?? ''
    let precio_venta = this.productosForm.get('precio_venta')!.value ?? ''
    let precio_venta2 = this.productosForm.get('precio_venta2')!.value ?? ''
    let margen = this.productosForm.get('margen')!.value ?? ''
    let adicionales = this.productosForm.get('adicionales')!.value ?? ''
    let descripcion = this.productosForm.get('descripcion')!.value ?? ''

    if (this.productosForm.valid) {
      console.log(precio_venta2)
      this.productoService.actualizar(this.idProducto, nombre, categoria, estatus, precio_compra, precio_venta, precio_venta2, margen, adicionales, descripcion, this.imagen).subscribe(
        response => {
          this.toastr.success('Se actualizó con éxito', 'Actualizar');
          this.mostrarProductos();
        }, error => {
          console.log(error)
          this.toastr.error("Existen errores al actualizar", 'Error',);
        }
      );
    } else {
      this.toastr.error("Formulario con errores", 'Error');
    }
  }

  public eliminarProductos(idRegistro: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminar(idRegistro).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarProductos();
          },
          error => {
            this.toastr.error(error.error.messages, 'Error',);
          }
        );
      }
    })

  }

  private obtenerCategorias(producto: any[]): string[] {
    const listaFiltroCategorias = new Set<string>();
    producto.forEach(producto => {
      listaFiltroCategorias.add(producto.categoria);
    });

    return Array.from(listaFiltroCategorias);
  }

  public filtrar() {
    this.listaProductosFiltrada = this.listaProductos.filter((producto: { nombre: string, categoria: string }) => {
      let filtroCategorias = true;
      if (this.filtroCategorias != "0") {
        filtroCategorias = producto.categoria === this.filtroCategorias;
      }
      let filtroNombres = true;
      if (this.filtroNombres) {
        filtroNombres = producto.nombre.toLowerCase().includes(this.filtroNombres.toLowerCase());
      }
      return filtroNombres && filtroCategorias;
    });
  }

  public filtrarIngredientes() {
    this.listaIngredientesFiltradaBusquedad = this.listaIngredientesBusquedad.filter((ingrediente: { nombre: string }) => {
      let filtroNombres = true;
      if (this.filtroNombresIngrediente) {
        filtroNombres = ingrediente.nombre.toLowerCase().includes(this.filtroNombresIngrediente.toLowerCase());
      }
      return filtroNombres;
    });
  }
  //Permite actualizar o registrar de acuerdo al modal que este abierto
  public verificarModal() {
    if (this.editarModal) {
      this.actualizarProductos();
    } else {
      this.registrarProductos();
    }
  }

  public calcularMargen() {
    const precioCompra = parseFloat(this.productosForm.get('precio_compra')!.value ?? '');
    const precioVenta = parseFloat(this.productosForm.get('precio_venta')!.value ?? '');
    if (!isNaN(precioCompra) && !isNaN(precioVenta)) {
      const margenCalculado = 100 - (precioCompra / precioVenta) * 100;
      console.log(margenCalculado.toFixed(2))
      this.productosForm.get('margen')?.setValue(margenCalculado.toFixed(2),
        { emitEvent: false });
    } else {
      this.productosForm.get('margen')?.setValue('', { emitEvent: false });
    }
  }

  //Permite abrir el modal de editar con los datos cargados
  public modalEditar(datos: any) {
    this.productosForm.reset();
    this.editarModal = true;
    this.idProducto = datos.id_producto;
    this.nombreImagen = datos.imagen
    //alert(datos.adicionales)

    this.productosForm.patchValue(
      {
        nombre: datos.nombre,
        categoria: datos.id_categoria,
        estatus: datos.estatus,
        precio_compra: datos.precio_compra,
        precio_venta: datos.precio_venta,
        precio_venta2: datos.precio_venta2,
        margen: datos.margen,
        gramaje: datos.gramaje,
        adicionales: datos.adicionales,
        descripcion: datos.descripcion,
      }
    );
  }

  public limpiarFormulario() {
    this.editarModal = false;
    this.nombreImagen = "";
    this.productosForm.reset();
  }

  public validarArchivo(event: Event) {
    this.imagen = (event.target as HTMLInputElement).files?.[0];
    const fileName = this.imagen?.name ?? '';
    const cleanFileName = fileName.replace(/\0/g, ''); // Eliminar caracteres nulos
    if (this.imagen) {
      const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // Lista de extensiones de imagen permitidas
      const extension = this.imagen.name.split('.').pop()?.toLowerCase();
      if (extension && allowedImageExtensions.includes(extension)) {
        this.productosForm.get('imagen')?.setErrors(null);
      } else {
        this.productosForm.get('imagen')?.setErrors({ formatInvalido: true });

      }
    }
  }

  public modalReceta(id_producto: string, nombreProducto: string) {
    this.idProducto = id_producto;
    this.nombreProducto = nombreProducto;
    this.mostrarReceta();
  }

  public mostrarIngredientes() {
    this.ingredienteService.mostrar().subscribe(data => {
      this.listaIngredientesBusquedad = data;
      this.listaIngredientesFiltradaBusquedad = this.listaIngredientesBusquedad;
      this.listaIngredientesFiltradaBusquedad.sort((a: any, b: any) => {
        // Utiliza a.nombre y b.nombre para comparar los nombres
        const nombreA = a.nombre.toUpperCase();
        const nombreB = b.nombre.toUpperCase();
        if (nombreA < nombreB) {
          return -1;
        }
        if (nombreA > nombreB) {
          return 1;
        }
        return 0; // Si los nombres son iguales
      });
    });
  }

  public onRowClick(item: any) {
    this.agregarIngrediente(item)
  }

  public agregarIngrediente(item: any) {
    this.listaIngredientes.push({ ingrediente_id: item.id_ingrediente, nombre_ingrediente: item.nombre, cantidad: 0 });
  }

  public eliminarIngrediente(index: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {

        this.listaIngredientes.splice(index, 1)

      }
    })
  }

  public crearReceta() {
    const recetas = this.listaIngredientes.map((ingrediente) => {
      return {
        producto_id: this.idProducto, // Puedes asignar un valor específico si es necesario
        ingrediente_id: ingrediente.ingrediente_id,
        cantidad: ingrediente.cantidad,
      };
    });
    const receta = {
      receta: recetas,
    };
    this.recetaService.crearReceta(receta).subscribe(
      response => {
        this.toastr.success('Se registró con éxito', 'Registrar');
      }, error => {
        console.log(error)
        this.toastr.error("Error al registrar", 'Error',);
      });
  }

  public actualizarReceta() {
    const recetas = this.listaIngredientes.map((ingrediente) => {
      return {
        producto_id: this.idProducto, // Puedes asignar un valor específico si es necesario
        ingrediente_id: ingrediente.ingrediente_id,
        cantidad: ingrediente.cantidad,
      };
    });
    const receta = {
      receta: recetas,
    };
    this.recetaService.actualizarReceta(this.idProducto, receta).subscribe(
      response => {
        this.toastr.success('Se modifico con éxito', 'Modificar');
        this.mostrarIngredientes()
      }, error => {
        console.log(error)
        this.toastr.error("Error al modificar", 'Error',);
      });
  }

  public guardarReceta() {
    if (this.crearOrEditarReceta) {
      this.crearReceta()
    } else {
      this.actualizarReceta()
    }
  }

  public mostrarReceta() {
    this.recetaService.mostrarReceta(this.idProducto).subscribe(
      data => {
        this.listaIngredientes = data;
        if (this.listaIngredientes.length == 0) {
          //True para crear
          this.crearOrEditarReceta = true;
        } else {
           //False para editar
          this.crearOrEditarReceta = false;
        }
      }, error => {
        console.log(error)
        this.toastr.error("Error al mostrar", 'Error',);
      });
  }

}
