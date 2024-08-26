import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MovimientoService } from './service/movimiento.service';
import { IngredientesService } from '../ingredientes/service/ingredientes.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrls: ['./movimiento.component.css']
})
export class MovimientoComponent implements OnInit {

  //Variables para paginacion
  paginaActual = 1;
  registrosPorPagina = 10;
  listaMovimientos: any[] = [];
  listaMovimientosFilt: any[] = [];
  listaDetallesProductos: any[] = [];
  filtroTipoMovimiento: string = "";
  fechaDesde: string = "";
  fechaHasta: string = "";
  filtroNombresIngrediente: string = "";
  listaIngredientesBusquedad: any = null;
  listaIngredientesFiltradaBusquedad: any = null;
  listaIngredientes: { ingrediente_id: string; nombre_ingrediente: string, cantidad: 0 }[] = [];
  editarModal : boolean = false;
  idMovimiento : string = "";

  constructor(private router: Router,
    private movimientoService: MovimientoService,
    private ingredienteService: IngredientesService,
    private toastr: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.fechaActual()
    this.mostrarMovimientos()
    this.mostrarIngredientes()

  }

  movimientoForm = new FormGroup({
    tipoMovimiento: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required),
    comentarios: new FormControl(''),

  });
  public fechaActual() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = currentDate.getFullYear();
    this.fechaDesde = `${year}-${month}-${day}`;
    this.fechaHasta = `${year}-${month}-${day}`;
  }

  public mostrarMovimientos() {
    this.movimientoService.mostrarMovimiento(this.fechaDesde, this.fechaHasta).subscribe(data => {
      this.listaMovimientos = data.sort((a: any, b: any) => parseFloat(b.numero_factura) - parseFloat(a.numero_factura));
      this.listaMovimientosFilt = this.listaMovimientos;
    });
  }

  public filtrar() {
    this.listaMovimientosFilt = this.listaMovimientos.filter(( movimiento: {  tipo_movimiento: string }) => {
      let filtroTipoMovimiento = true;
      if (this.filtroTipoMovimiento) {
        filtroTipoMovimiento = movimiento.tipo_movimiento === this.filtroTipoMovimiento;
      }
      return filtroTipoMovimiento;
    });
  }

  public crearMovimiento() {
    if (this.listaIngredientes.length != 0 && this.movimientoForm.valid) {
      let fecha = this.movimientoForm.get('fecha')!.value ?? ''
      let tipoMovimiento = this.movimientoForm.get('tipoMovimiento')!.value ?? ''
      let comentarios = this.movimientoForm.get('comentarios')!.value ?? ''
      let movimientoCabecera = {
        "fecha": fecha,
        "tipo_movimiento": tipoMovimiento,
        "comentario": comentarios
      }

      const movimientoCuerpo = this.listaIngredientes.map((ingrediente) => {
        return {
          movimientos_id: 0,
          cantidad: ingrediente.cantidad,
          ingrediente_id: ingrediente.ingrediente_id,
        };
      });

      const movimiento = {
        movimiento: movimientoCabecera,
        detalle: movimientoCuerpo,
      };
      this.movimientoService.crearMovimiento(movimiento).subscribe(
        response => {
          this.toastr.success('Se registró con éxito', 'Registrar');
          this.limpiarModal()
          this.mostrarMovimientos();
        }, error => {
          console.log(error)
          this.toastr.error("Error al registrar", 'Error',);
        });

    } else {
      this.toastr.error('Existen campos vacios', 'Movimiento',);
    }
  }

  public actualizarMovimiento() {
    if (this.listaIngredientes.length != 0 && this.movimientoForm.valid) {
      let fecha = this.movimientoForm.get('fecha')!.value ?? ''
      let tipoMovimiento = this.movimientoForm.get('tipoMovimiento')!.value ?? ''
      let comentarios = this.movimientoForm.get('comentarios')!.value ?? ''

      let movimientoCabecera = {
        "fecha": fecha,
        "tipo_movimiento": tipoMovimiento,
        "comentario": comentarios
      }

      const movimientoCuerpo = this.listaIngredientes.map((ingrediente) => {
        return {
          movimientos_id: 0,
          cantidad: ingrediente.cantidad,
          ingrediente_id: ingrediente.ingrediente_id,
        };
      });

      const movimiento = {
        movimiento: movimientoCabecera,
        detalle: movimientoCuerpo,
      };
      this.movimientoService.actualizarMovimiento(this.idMovimiento,movimiento).subscribe(
        response => {
          this.toastr.success('Se modificó con éxito', 'Modificar');
          this.mostrarMovimientos();
        }, error => {
          this.toastr.error("Error al modificar", 'Error',);
        });

    } else {
      this.toastr.error('Existen campos vacios', 'Movimiento',);
    }
  }

  public eliminarMovimiento(idMovimiento: string){
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir esto!",
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.movimientoService.eliminarMovimiento(idMovimiento).subscribe(
          response => {
            this.toastr.success('Se eliminó con éxito', 'Eliminar');
            this.mostrarMovimientos();
          }, error => {
            console.log(error)
            this.toastr.error("Error al eliminar", 'Error',);
          });
      }
    })
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

  public filtrarIngredientes() {
    this.listaIngredientesFiltradaBusquedad = this.listaIngredientesBusquedad.filter((ingrediente: { nombre: string }) => {
      let filtroNombres = true;
      if (this.filtroNombresIngrediente) {
        filtroNombres = ingrediente.nombre.toLowerCase().includes(this.filtroNombresIngrediente.toLowerCase());
      }
      return filtroNombres;
    });
  }

  public onRowClick(item: any) {
    this.agregarIngrediente(item)
  }

  public agregarIngrediente(item: any) {
    this.listaIngredientes.push({ ingrediente_id: item.id_ingrediente, nombre_ingrediente: item.nombre, cantidad: 0 });
  }

  public limpiarModal(){
    this.editarModal = false;
    this.listaIngredientes = [];
    this.movimientoForm.reset();
  }

  public modalEditar(datos: any){
    this.movimientoForm.reset();
    this.editarModal = true;
    this.idMovimiento = datos.id_movimientos;
    this.movimientoForm.patchValue(
      {
        tipoMovimiento: datos.tipo_movimiento,
        fecha: datos.fecha,
        comentarios: datos.comentario,
      }
    );
    this.mostrarDetallesMovimientos()
  }

  private mostrarDetallesMovimientos() {
    this.movimientoService.mostrarDetallesMovimiento(this.idMovimiento).subscribe(data => {
      this.listaIngredientes = data;        
    });
  }

  public registarOEditarMovimiento(){
    if(!this.editarModal){
      this.crearMovimiento();
    }else{
      this.actualizarMovimiento();
    }
  }
}
