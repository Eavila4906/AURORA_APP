import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CategoriaService } from './service/categoria.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;

  filtroNombres: string = "";
  listaCategorias: any = null;
  listaCategoriasFiltrada: any = null;
  editarModal = false;
  idCategoria: string = "";
  categoriasForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
  });

  constructor(
    private AppService: AppService,
    private router: Router,
    private categoriaService: CategoriaService,
    private toastr: ToastrService
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

    this.mostrarCategorias();
  }

  public mostrarCategorias() {
    this.categoriaService.mostrar().subscribe(data => {
      this.listaCategorias = data;
      this.listaCategoriasFiltrada = this.listaCategorias;
    });
  }

  public registrarCategorias() {
    let nombre = this.categoriasForm.get('nombre')!.value ?? ''
    if (this.categoriasForm.valid) {
      this.categoriaService.registrar(nombre).subscribe(
        response => {
          this.toastr.success('Se registró con éxito', 'Registrar');
          this.categoriasForm.reset();
          this.mostrarCategorias();
        }, error => {
          this.toastr.error(error.error.messages.error, 'Error',);
        }
      );
    } else {
      this.toastr.error("Formulario con errores", 'Error');
    }
  }

  public actualizarCategorias() {
    let nombre = this.categoriasForm.get('nombre')!.value ?? ''
    let categoria = {
      'nombre': nombre
    }
    if (this.categoriasForm.valid) {
      this.categoriaService.actualizar(this.idCategoria, categoria).subscribe(
        response => {
          this.toastr.success('Se actualizó con éxito', 'Actualizar');
          this.mostrarCategorias();
        }, error => {
          console.log(error)
          this.toastr.error(error.error.messages.error, 'Error',);
        }
      );
    } else {
      this.toastr.error("Formulario con errores", 'Error');
    }
  }

  public eliminarCategorias(idRegistro: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminar(idRegistro).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarCategorias();
          },
          error => {
            this.toastr.error(error.error.messages, 'Error',);
          }
        );
      }
    })

  }

  public filtrar() {
    this.listaCategoriasFiltrada = this.listaCategorias.filter((categoria: { nombre: string }) => {
      let filtroNombres = true;
      if (this.filtroNombres) {
        filtroNombres = categoria.nombre.toLowerCase().includes(this.filtroNombres.toLowerCase());
      }
      return filtroNombres;
    });
  }

  //Permite actualizar o registrar de acuerdo al modal que este abierto
  public verificarModal() {
    if (this.editarModal) {
      this.actualizarCategorias();
    } else {
      this.registrarCategorias();
    }
  }

  public limpiarFormulario() {
    this.editarModal = false;
    this.categoriasForm.reset();
  }

  //Permite abrir el modal de editar con los datos cargados
  public modalEditar(datos: any) {
    this.editarModal = true;
    this.idCategoria = datos.id_categoria;
    this.categoriasForm.patchValue(
      {
        nombre: datos.nombre,
      }
    );
  }
}
