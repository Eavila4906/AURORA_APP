import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import { AppService } from 'src/app/services/app.service';
import { ClientesService } from './services/clientes.service';
import { OtherServicesService } from 'src/app/services/other-services/other-services.service';
import { VehiculosService } from './services/vehiculos.service';

interface Cliente {
  nombres: string;
  apellidos: string;
  identificacion_id: number;
  numeroIdentificacion: string;
  telefono: string;
  email: string;
  direccion: string;
}

interface Vehiculo {
  descripcion: string;
  marca: string;
  modelo: string;
  cilindraje: string;
  color: string;
  anio: number;
  placa: string;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  @ViewChild('ModalNew') ModalNew?: ModalDirective;
  @ViewChild('ModalEdit') ModalEdit?: ModalDirective;
  @ViewChild('ModalSee') ModalSee?: ModalDirective;
  @ViewChild('ModalVehiculos') ModalVehiculos?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;
  registrarVehiculo: boolean = false;
  editarVehiculo: boolean = false;

  clientes: any[] = [];
  id: number = 0;
  nombres: string = '';
  apellidos: string = '';
  identificacion_id: number = 0;
  numeroIdentificacion: string = '';
  telefono: string = '';
  email: string = '';
  direccion: string = '';
  gestionaVehiculo: boolean = false;
  vehiculo: any [] = [];
  estado: string = 'Activo';

  veh_id: number = 0;
  veh_descripcion: string = '';
  veh_marca: string = '';
  veh_modelo: string = '';
  veh_cilindraje: string = '';
  veh_color: string = '';
  veh_anio: number = 0;
  veh_placa: string = '';

  tiposIdentificacion: any[] = [];
  tipoIdentificacion: string = '';

  newCliente: Cliente = {
    nombres: '',
    apellidos: '',
    identificacion_id: 0,
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  newVehiculo: Vehiculo = {
    descripcion: '',
    marca: '',
    modelo: '',
    cilindraje: '',
    color: '',
    anio: 0,
    placa: ''
  };

  //Search
  search: string = '';
  clientesFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  resetForm() {
    this.newCliente.nombres = '';
    this.newCliente.apellidos = '';
    this.newCliente.identificacion_id = 0;
    this.newCliente.numeroIdentificacion = '';
    this.newCliente.telefono = '';
    this.newCliente.email = '';
    this.newCliente.direccion = '';
    this.gestionaVehiculo = false;

    this.newVehiculo.descripcion = '';
    this.newVehiculo.marca = '';
    this.newVehiculo.modelo = '';
    this.newVehiculo.cilindraje = '';
    this.newVehiculo.color = '';
    this.newVehiculo.anio = 0;
    this.newVehiculo.placa = '';

    this.id = 0;
    this.nombres = '';
    this.apellidos = '';
    this.identificacion_id = 0;
    this.numeroIdentificacion = '';
    this.telefono = '';
    this.email = '';
    this.direccion = '';
    this.vehiculo = [];
    this.estado = 'Activo';

    this.veh_id = 0;
    this.veh_descripcion = '';
    this.veh_marca = '';
    this.veh_modelo = '';
    this.veh_cilindraje = '';
    this.veh_color = '';
    this.veh_anio = 0;
    this.veh_placa = '';
  }

  resetFormVeh() {
    this.newVehiculo.descripcion = '';
    this.newVehiculo.marca = '';
    this.newVehiculo.modelo = '';
    this.newVehiculo.cilindraje = '';
    this.newVehiculo.color = '';
    this.newVehiculo.anio = 0;
    this.newVehiculo.placa = '';

    this.veh_id = 0;
    this.veh_descripcion = '';
    this.veh_marca = '';
    this.veh_modelo = '';
    this.veh_cilindraje = '';
    this.veh_color = '';
    this.veh_anio = 0;
    this.veh_placa = '';
  }

  constructor(
    private AppService: AppService,
    private ClientesService: ClientesService,
    private TiposIdentificacionService: OtherServicesService,
    private VehiculosService: VehiculosService,
    private toastr: ToastrService,
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
      }
    );

    this.ClientesService.getAll().subscribe(
      response => {
        this.clientes = response.data.sort((a: any, b: any) => b.id - a.id);
        this.clientesFilter = this.clientes;
        this.loading = false;
      }
    );

    this.getTiposIdentificacion();
  }

  /**
   * MODALS
   */

  openModalCreate() {
    this.ModalNew?.show();
  }

  openModalEdit(id: number) {
    this.getCliente(id);
    this.ModalEdit?.show();
  }

  openModalSee(id: number) {
    this.getCliente(id);
    this.ModalSee?.show();
  }

  openModalVehiculos(id: number) {
    this.getCliente(id);
    this.verInfoVehiculo = false;
    this.selectedVehiculo = null;
    this.ModalVehiculos?.show();
  }

  formEditarVehiculo(id: number) {
    this.editarVehiculo = true;
    this.verInfoVehiculo = false;
    this.getVehiculo(id);
  }

  /**
   * SERIVECES
   */ 

  getCliente(id: number) {
    this.ClientesService.get(id).subscribe(
      response => {
        this.id = response.data.id;
        this.nombres = response.data.nombres;
        this.apellidos = response.data.apellidos;
        this.identificacion_id = response.data.identificacion_id;
        this.tipoIdentificacion = response.data.identificacion;
        this.numeroIdentificacion = response.data.numeroIdentificacion;
        this.telefono = response.data.telefono;
        this.email = response.data.email;
        this.direccion = response.data.direccion;
        this.gestionaVehiculo = response.data.gestionaVehiculo;
        this.vehiculo = response.data.vehiculo;
        this.estado = response.data.estado;
      }
    );
  }

  getVehiculo(id: number) {
    this.VehiculosService.get(id).subscribe(
      response => {
        this.veh_id = response.data.id;
        this.veh_descripcion = response.data.descripcion;
        this.veh_marca = response.data.marca;
        this.veh_modelo = response.data.modelo;
        this.veh_cilindraje = response.data.cilindraje;
        this.veh_color = response.data.color;
        this.veh_anio = response.data.anio;
        this.veh_placa = response.data.placa;
      }
    );
  }

  getTiposIdentificacion() {
    this.TiposIdentificacionService.getTiposIdentificacion().subscribe(
      response => {
        this.tiposIdentificacion = response.data.filter( (tipo: any) => tipo.estado === 'Activo');
      }
    );
  }

  create() {
    let data = {
      data: {
        nombres: this.newCliente.nombres,
        apellidos: this.newCliente.apellidos,
        identificacion_id: this.newCliente.identificacion_id,
        numeroIdentificacion: this.newCliente.numeroIdentificacion,
        telefono: this.newCliente.telefono,
        email: this.newCliente.email,
        direccion: this.newCliente.direccion,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.ClientesService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetForm();
          this.ModalNew?.hide();
        }
      }
    );
  }

  edit(id: number) {
    let data = {
      data: {
        id: id,
        nombres: this.nombres,
        apellidos: this.apellidos,
        identificacion_id: this.identificacion_id,
        numeroIdentificacion: this.numeroIdentificacion,
        telefono: this.telefono,
        email: this.email,
        direccion: this.direccion,
        estado: this.estado,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.ClientesService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.ModalEdit?.hide();
          this.resetForm();
        }
      }
    );
  }

  delete(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ClientesService.delete(id).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', { closeButton: true });
              this.ngOnInit();
              this.resetForm();
            }
          }
        );
      }
    });
  }

  saveVehiculo(cliente_id: number) {
    let data = {
      data: {
        cliente_id: cliente_id,
        descripcion: this.newVehiculo.descripcion,
        marca: this.newVehiculo.marca,
        modelo: this.newVehiculo.modelo,
        cilindraje: this.newVehiculo.cilindraje,
        color: this.newVehiculo.color,
        anio: this.newVehiculo.anio,
        placa: this.newVehiculo.placa,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.VehiculosService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetFormVeh();
          this.registrarVehiculo = false;
          this.getCliente(cliente_id);
        }
      }
    );
  }

  editVehiculo(id: number) {
    let data = {
      data: {
        id: id,
        descripcion: this.veh_descripcion,
        marca: this.veh_marca,
        modelo: this.veh_modelo,
        cilindraje: this.veh_cilindraje,
        color: this.veh_color,
        anio: this.veh_anio,
        placa: this.veh_placa,
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.VehiculosService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
          this.resetFormVeh();
          this.editarVehiculo = false;
          this.getCliente(this.id);
        }
      }
    );
  }

  deleteVehiculo(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este registro?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.VehiculosService.delete(id).subscribe(
          response => {
            if (response.data) {
              this.toastr.success(response.message, '¡Listo!', { closeButton: true });
              this.ngOnInit();
              this.editarVehiculo = false;
              this.getCliente(this.id);
            }
          }
        );
      }
    });
  }

  verInfoVehiculo: boolean = false;
  selectedVehiculo: any = null;
  seeInfoVehiculo(id: number) {
    const vehiculo = this.vehiculo.find(v => v.id === id);
    if (vehiculo) {
      this.selectedVehiculo = vehiculo;
      this.verInfoVehiculo = true;
      this.registrarVehiculo = false;
      this.editarVehiculo = false;
    }
  }

  hideInfoVehiculo() {
    this.verInfoVehiculo = false;
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    this.clientesFilter = this.clientes.filter((cliente: { 
      nombres: string, 
      apellidos: string,
      numeroIdentificacion: string,
      identificacion: string,
      direccion: string,
      estado: string 
    }) => {
      let filter = true;
      if (this.search) {
        filter = cliente.nombres?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.apellidos?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.numeroIdentificacion?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.identificacion?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.direccion?.toLowerCase().includes(this.search.toLowerCase()) || 
        cliente.estado?.toLowerCase().startsWith(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.clientesFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

  toggleRegistrarVehiculo() {
    this.registrarVehiculo = !this.registrarVehiculo;
    this.verInfoVehiculo = false;
  }

  toggleEditarVehiculo() {
    this.editarVehiculo = !this.editarVehiculo;
    this.verInfoVehiculo = false;
  }

  generateReporteVehiculo(op: number): void {
    const docDefinition: any = {
      content: [
        {
          text: `Reporte del vehículo ${this.selectedVehiculo.descripcion}`,
          style: 'header',
          alignment: 'center',
          margin: [0, 10],
        },
  
        // Divider
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#bbbbbb' }] },
        { text: '', margin: [0, 10] },

        {
          table: {
            widths: ['20%', '15%', '15%', '15%', '10%', '10%', '15%'], // Ajustamos las columnas
            body: [
              [
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Marca', style: 'tableHeader' },
                { text: 'Modelo', style: 'tableHeader' },
                { text: 'Cilindraje', style: 'tableHeader' },
                { text: 'Color', style: 'tableHeader' },
                { text: 'Año', style: 'tableHeader' },
                { text: 'Placa', style: 'tableHeader' },
              ],
              [
                { text: this.selectedVehiculo.descripcion },
                { text: this.selectedVehiculo.marca },
                { text: this.selectedVehiculo.modelo },
                { text: this.selectedVehiculo.cilindraje },
                { text: this.selectedVehiculo.color },
                { text: this.selectedVehiculo.anio },
                { text: this.selectedVehiculo.placa },
              ],
            ],
          },
          layout: 'headerLineOnly',
          margin: [0, 5],
        },
        {
          text: [
            { text: 'Responsable: ', bold: true },
            `${this.nombres + ' ' + this.apellidos}`
          ],
          style: 'subInfo',
          margin: [0, 10],
        },

        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#bbbbbb' }] },
        { text: '', margin: [0, 10] },
  
        // Órdenes
        this.selectedVehiculo.orden && this.selectedVehiculo.orden.length > 0
          ? {
              stack: this.selectedVehiculo.orden.map((orden: any) => [
                {
                  text: `Orden: ${orden.codigoOrden}`, // Aquí mostramos el código de la orden
                  style: 'ordenHeader',
                  margin: [0, 10],
                  bold: true,
                },
                {
                  table: {
                    widths: ['30%', '30%', '40%'], // Ajustamos las columnas
                    body: [
                      [
                        { text: 'Descripción', style: 'tableHeader' },
                        { text: 'Fecha', style: 'tableHeader' },
                        { text: 'Estado', style: 'tableHeader' },
                      ],
                      [
                        { text: orden.descripcion },
                        { text: orden.fecha },
                        {
                          text: orden.estado,
                          color:
                            orden.estado === 'Atendida'
                              ? '#28a745'
                              : orden.estado === 'Pendiente'
                              ? '#ffc107'
                              : orden.estado === 'Anulada' ? '#dc3545' : '#dc3545',
                          bold: true,
                        },
                      ],
                    ],
                  },
                  layout: 'headerLineOnly',
                  margin: [0, 5],
                },
                {
                  table: {
                    widths: ['30%', '30%', '40%'], // Ajustamos las columnas
                    body: [
                      [
                        { text: 'Factura', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                        { text: 'Estado', style: 'tableHeader' },
                      ],
                      [
                        { text: orden.cab_factura.codigoFactura },
                        { text: orden.cab_factura.total },
                        {
                          text: orden.cab_factura.estado,
                          color:
                            orden.cab_factura.estado === 'Pagada'
                              ? '#28a745'
                              : orden.cab_factura.estado === 'Por cobrar'
                              ? '#ffc107'
                              : orden.cab_factura.estado === 'Anulada' ? '#dc3545' : '#dc3545',
                          bold: true,
                        },
                      ],
                    ],
                  },
                  layout: 'headerLineOnly',
                  margin: [0, 5],
                },
                {
                  text: 'Observaciones:',
                  style: 'subHeader',
                  margin: [0, 10],
                },
                orden.mantenimiento && orden.mantenimiento.length > 0
                  ? {
                      table: {
                        widths: ['30%', '70%'], // Ajustamos las columnas de observaciones
                        body: [
                          [
                            { text: 'Tipo', style: 'tableHeader' },
                            { text: 'Descripción', style: 'tableHeader' },
                          ],
                          ...orden.mantenimiento.map((mant: any) => [
                            { text: mant.tipo },
                            { text: mant.observaciones },
                          ]),
                        ],
                      },
                      layout: 'lightHorizontalLines',
                      margin: [0, 5],
                    }
                  : { text: 'No hay observaciones de mantenimiento.', italics: true, margin: [0, 5] },

                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#bbbbbb' }] },
                { text: '', margin: [0, 10] },
              ]),
            }
          : { text: 'No hay órdenes para este vehículo.', alignment: 'center', margin: [0, 10] },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        ordenHeader: {
          fontSize: 14,
          bold: true,
        },
        subHeader: {
          fontSize: 12,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          fillColor: '#f2f2f2',
        },
        subInfo: {
          fontSize: 10,
          fillColor: '#f2f2f2',
        }
      },
    };
  
    if (op === 1) {
      // Imprimir
      pdfMake.createPdf(docDefinition).print();
    } else {
      // Descargar
      pdfMake.createPdf(docDefinition).download(`Reporte_Vehiculo_${this.selectedVehiculo.descripcion}.pdf`);
    }
  }

}
