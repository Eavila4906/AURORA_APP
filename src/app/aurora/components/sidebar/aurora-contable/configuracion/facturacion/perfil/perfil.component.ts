import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { PerfilService } from './services/perfil.service';
import { EstablecimientosService } from '../establecimientos/services/establecimientos.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  @ViewChild('ModalFirmaElectronica') ModalFirmaElectronica?: ModalDirective;

  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  id: number = 0;
  emisor: string = '';
  ruc: string = '';
  establecimiento_id: number = 0;
  nombreEstablecimiento: string = '';
  logo: any | ArrayBuffer | null = 'https://via.placeholder.com/200';
  firmaElectronica: string = '';
  certificadoFirma: File | null = null;
  claveFirma: string = '';
  fechaVigencia: string = '';
  propietarioCertificado: string = '';
  contribuyenteRimpe: string = '';
  contribuyenteEspecial: string = '';
  negocioPopular: string = '';
  obligadoContabilidad: string = '';
  agenteRetencion: string = '';

  establecimientos: any[] = [];

  imageError: any | null = null;
  fileSelected: File | null = null;

  resetForm() {
    this.id = 0;
    this.emisor = '';
    this.ruc = '';
    this.establecimiento_id = 0;
    this.nombreEstablecimiento = '';
    this.logo = 'https://via.placeholder.com/200';
    this.firmaElectronica = '';
    this.claveFirma = '';
    this.fechaVigencia = '';
    this.propietarioCertificado = '';
    this.contribuyenteRimpe = '';
    this.contribuyenteEspecial = '';
    this.negocioPopular = '';
    this.obligadoContabilidad = '';
    this.agenteRetencion = '';
  }

  constructor(
    private AppService: AppService,
    private PerfilService: PerfilService,
    private EstablecimientosService: EstablecimientosService,
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

    this.getPerfil();
    this.getEstablecimientos();
  }

  /**
   * MODALS
   */

  openModalFirmaElectronica() {
    this.ModalFirmaElectronica?.show();
  }

  /**
   * SERVICES
   */

  getPerfil() {
    this.PerfilService.get().subscribe(
      response => {
        this.id = response.data.id;
        this.emisor = response.data.emisor;
        this.ruc = response.data.ruc;
        this.establecimiento_id = response.data.establecimiento_id;
        this.nombreEstablecimiento = response.data.nombreEstablecimiento;
        this.logo = response.data.logo === '' || response.data.logo === null ? 'https://via.placeholder.com/200' :
          this.AppService.getAuroraApiContable().replace('/api', '/storage/') + response.data.logo;

        // Firma electrónica
        this.firmaElectronica = response.data.firmaElectronica;
        this.claveFirma = response.data.claveFirma === null ? '' : response.data.claveFirma;
        this.fechaVigencia = response.data.fechaVigencia;
        this.propietarioCertificado = response.data.propietarioCertificado;
        this.contribuyenteRimpe = response.data.contribuyenteRimpe;
        this.contribuyenteEspecial = response.data.contribuyenteEspecial;
        this.negocioPopular = response.data.negocioPopular;
        this.obligadoContabilidad = response.data.obligadoContabilidad;
        this.agenteRetencion = response.data.agenteRetencion;
      }
    );
  }

  getEstablecimientos() {
    this.EstablecimientosService.getAll().subscribe(
      response => {
        this.establecimientos = response.data.filter((puntoDeEmision: any) => puntoDeEmision.estado === 'Activo');
      }
    );
  }

  save() {
    if (this.id === 0) {
      this.create();
    } else {
      this.edit();
    }
    if (this.fileSelected) {
      this.subirLogo();
    }
  }

  create() {
    let data = {
      data: {
        emisor: this.emisor,
        ruc: this.ruc,
        establecimiento_id: this.establecimiento_id,
        auditoria: this.AppService.getDataAuditoria('create')
      }
    };

    this.PerfilService.create(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.resetForm();
          this.ngOnInit();
        }
      }
    );
  }

  edit() {
    let data = {
      data: {
        emisor: this.emisor,
        ruc: this.ruc,
        establecimiento_id: this.establecimiento_id,
        estado: 'Activo',
        auditoria: this.AppService.getDataAuditoria('edit')
      }
    };

    this.PerfilService.edit(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.resetForm();
          this.ngOnInit();
        }
      }
    );
  }

  delete(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '<strong>¿Esta seguro que desea eliminar este perfil?</strong>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.PerfilService.delete(id).subscribe(
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

  registrarFirma() {
    let data = {
      firmaElectronica: this.firmaElectronica,
      certificadoFirma: this.certificadoFirma,
      claveFirma: this.claveFirma,
      fechaVigencia: this.fechaVigencia,
      propietarioCertificado: this.propietarioCertificado,
      contribuyenteRimpe: this.contribuyenteRimpe,
      contribuyenteEspecial: this.contribuyenteEspecial,
      negocioPopular: this.negocioPopular,
      obligadoContabilidad: this.obligadoContabilidad,
      agenteRetencion: this.agenteRetencion
    }  

    this.PerfilService.registrarFirma(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.resetForm();
          this.ngOnInit();
        }
      }
    );
  }

  subirLogo() {
    let data = this.fileSelected;  

    this.PerfilService.subirLogo(data).subscribe(
      response => {
        if (response.data) {
          this.toastr.success(response.message, '¡Listo!', { closeButton: true });
          this.ngOnInit();
        }
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  onFileSelected(event: any): void {
    const file = event.target.files[0];
  
    if (file) {
      // Validar tamaño del archivo (máximo 100 KB)
      if (file.size > 100 * 1024) {
        this.imageError = 'El tamaño de la imagen debe ser menor a 100 KB';
        return;
      }
  
      // Validar formato del archivo (.jpg o .png)
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.imageError = 'Solo se permiten imágenes en formato .jpg o .png';
        return;
      }
  
      // Validar dimensiones de la imagen (máximo 200x200 píxeles)
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
  
        img.onload = () => {
          const width = img.width;
          const height = img.height;
  
          if (width > 200 || height > 200) {
            this.imageError = 'Las dimensiones del logo deben ser de máximo 200x200 píxeles';
            return;
          }
  
          // Previsualización de la imagen si cumple las validaciones
          this.logo = e.target?.result;
          this.imageError = null; // Limpiar el mensaje de error si la imagen es válida
          this.fileSelected = file; // Guardar el archivo para su envío
        };
      };
  
      reader.readAsDataURL(file);
    }
  }

  onFileCertificadoFirma(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.certificadoFirma = file;
    }
  }
}
