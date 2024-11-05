import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IngredientesService } from './service/ingredientes.service';
import Swal from 'sweetalert2';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ingredientes',
  templateUrl: './ingredientes.component.html',
  styleUrls: ['./ingredientes.component.css']
})
export class IngredientesComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;

  filtroNombres: string = "";
  listaIngredientes: any = null;
  listaIngredientesFiltrada: any = null;
  idIngrediente: string = "";

  editarModal = false;
  idIngredientes: string = "";

  ingredientesForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    medida: new FormControl('', Validators.required),
  });

  constructor(
    private AppService: AppService,
    private router: Router,
    private ingredienteService: IngredientesService,
    private toastr: ToastrService,
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
    
    this.mostrarIngredientes()
  }

  public mostrarIngredientes() {
    this.ingredienteService.mostrar().subscribe(data => {
      this.listaIngredientes = data;
      this.listaIngredientesFiltrada = this.listaIngredientes;
    }, error => {
      this.toastr.error(error.error.messages.error, 'Error',);
    }
    );

  }

  public registrarIngredientes() {
    let nombre = this.ingredientesForm.get('nombre')!.value ?? ''
    let medida = this.ingredientesForm.get('medida')!.value ?? ''

    if (this.ingredientesForm.valid) {
      this.ingredienteService.registrar(nombre, medida).subscribe(
        response => {
          this.toastr.success('Se registró con éxito', 'Registrar');
          this.ingredientesForm.reset();
          this.mostrarIngredientes();
        }, error => {
          console.log(error)
          this.toastr.error(error, 'Error',);
        }
      );
    } else {
      this.toastr.error("Formulario con errores", 'Error');
    }
  }

  public actualizarIngredientes() {
    let nombre = this.ingredientesForm.get('nombre')!.value ?? ''
    let medida = this.ingredientesForm.get('medida')!.value ?? ''

    let ingrediente = {
      'nombre': nombre,
      'medida': medida,
    }
    if (this.ingredientesForm.valid) {
      this.ingredienteService.actualizar(this.idIngrediente, ingrediente).subscribe(
        response => {
          this.toastr.success('Se actualizó con éxito', 'Actualizar');
          this.mostrarIngredientes();
        }, error => {
          console.log(error)
          this.toastr.error(error.error.messages.error, 'Error',);
        }
      );
    } else {
      this.toastr.error("Formulario con errores", 'Error');
    }
  }

  public eliminarIngredientes(idRegistro: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ingredienteService.eliminar(idRegistro).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarIngredientes();
          },
          error => {
            this.toastr.error(error.error.messages, 'Error',);
          }
        );
      }
    })

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

  //Permite actualizar o registrar de acuerdo al modal que este abierto
  public verificarModal() {
    if (this.editarModal) {
      this.actualizarIngredientes();
    } else {
      this.registrarIngredientes();
    }
  }

  public limpiarFormulario() {
    this.editarModal = false;
    this.ingredientesForm.reset();
  }

  //Permite abrir el modal de editar con los datos cargados
  public modalEditar(datos: any) {
    console.log(datos)
    this.editarModal = true;
    this.idIngrediente = datos.id_ingrediente;
    this.ingredientesForm.patchValue(
      {
        nombre: datos.nombre,
        medida: datos.medida,
      }
    );
  }

}
