import { CUSTOM_ELEMENTS_SCHEMA,NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';

import { HeaderComponent } from './components/header/header.component'; 
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/sidebar/home/home.component';
import { NavComponent } from './components/nav/nav.component'; 

/**
 * Componentes de Aurora restaurant
 */
import { GeneralComponent } from './components/sidebar/restaurant/reportes/general/general/general.component';
import { ProductosComponent } from './components/sidebar/restaurant/productos/productos.component';
import { CategoriasComponent } from './components/sidebar/restaurant/categorias/categorias.component';
import { CrearOrdenComponent } from './components/sidebar/restaurant/orden/crear-orden/crear-orden.component';
import { OrdenPendienteComponent } from './components/sidebar/restaurant/orden/orden-pendiente/orden-pendiente.component';
import { DetallesOrdenComponent } from './components/sidebar/restaurant/orden/detalles-orden/detalles-orden.component';
import { SlideProductosComponent } from './components/sidebar/restaurant/orden/slide-productos/slide-productos.component';
import { OrdenPagadaComponent } from './components/sidebar/restaurant/orden/orden-pagada/orden-pagada.component';
import { DeliveryComponent } from './components/sidebar/restaurant/delivery/delivery.component';
import { ComercialComponent } from './components/sidebar/restaurant/reportes/comercial/comercial/comercial.component';
import { IngredientesComponent } from './components/sidebar/restaurant/ingredientes/ingredientes.component';
import { MovimientoComponent } from './components/sidebar/restaurant/movimiento/movimiento.component';
import { StockComponent } from './components/sidebar/restaurant/reportes/ingredientes/stock/stock.component';
import { VentasComponent } from './components/sidebar/restaurant/reportes/ingredientes/ventas/ventas.component';

/**
 * Componentes de administración de Aurora
 */
import { UsuariosComponent } from './components/sidebar/administracion/usuarios/usuarios.component';
import { RolesComponent } from './components/sidebar/administracion/roles/roles.component';
import { ModulacionComponent } from './components/sidebar/administracion/modulacion/modulacion.component';
import { ModulosComponent } from './components/sidebar/administracion/modulacion/modulos/modulos.component';
import { SubmodulosComponent } from './components/sidebar/administracion/modulacion/submodulos/submodulos.component';
import { ItemsComponent } from './components/sidebar/administracion/modulacion/items/items.component';
import { EmpresasComponent } from './components/sidebar/administracion/empresas/empresas.component';

@NgModule({
  providers: [
    DatePipe
  ],
  declarations: [
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    NavComponent,
    GeneralComponent,
    ProductosComponent,
    CategoriasComponent,
    CrearOrdenComponent,
    OrdenPendienteComponent,
    DetallesOrdenComponent,
    SlideProductosComponent,
    OrdenPagadaComponent,
    DeliveryComponent,
    ComercialComponent,
    IngredientesComponent,
    MovimientoComponent,
    StockComponent,
    VentasComponent,
    UsuariosComponent,
    RolesComponent,
    ModulacionComponent,
    ModulosComponent,
    SubmodulosComponent,
    ItemsComponent,
    EmpresasComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
  ],
  exports:[
    HomeComponent,
    HeaderComponent,
    FooterComponent
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})

export class AuroraModule { }
