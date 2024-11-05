import { CUSTOM_ELEMENTS_SCHEMA,NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';

/**
 * Aurora base
 */
import { HeaderComponent } from './components/header/header.component'; 
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/sidebar/home/home.component';
import { NavComponent } from './components/nav/nav.component'; 
import { SpinnerComponentComponent } from './components/spinner-component/spinner-component.component';

/**
 * Componentes de Aurora Administrativo
 */
import { UsuariosComponent } from './components/sidebar/aurora-administrativo/usuarios/usuarios.component';
import { RolesComponent } from './components/sidebar/aurora-administrativo/roles/roles.component';
import { ModulosComponent } from './components/sidebar/aurora-administrativo/modulacion/modulos/modulos.component';
import { SubmodulosComponent } from './components/sidebar/aurora-administrativo/modulacion/submodulos/submodulos.component';
import { ItemsComponent } from './components/sidebar/aurora-administrativo/modulacion/items/items.component';
import { EmpresasComponent } from './components/sidebar/aurora-administrativo/empresas/empresas.component';
import { AplicacionesComponent } from './components/sidebar/aurora-administrativo/aplicaciones/aplicaciones.component';

/**
 * Componentes de Aurora Restaurant
 */
import { GeneralComponent } from './components/sidebar/aurora-restaurant/reportes/general/general/general.component';
import { ProductosComponent } from './components/sidebar/aurora-restaurant/productos/productos.component';
import { CategoriasComponent } from './components/sidebar/aurora-restaurant/categorias/categorias.component';
import { CrearOrdenComponent } from './components/sidebar/aurora-restaurant/orden/crear-orden/crear-orden.component';
import { OrdenPendienteComponent } from './components/sidebar/aurora-restaurant/orden/orden-pendiente/orden-pendiente.component';
import { DetallesOrdenComponent } from './components/sidebar/aurora-restaurant/orden/detalles-orden/detalles-orden.component';
import { SlideProductosComponent } from './components/sidebar/aurora-restaurant/orden/slide-productos/slide-productos.component';
import { OrdenPagadaComponent } from './components/sidebar/aurora-restaurant/orden/orden-pagada/orden-pagada.component';
import { DeliveryComponent } from './components/sidebar/aurora-restaurant/delivery/delivery.component';
import { ComercialComponent } from './components/sidebar/aurora-restaurant/reportes/comercial/comercial/comercial.component';
import { IngredientesComponent } from './components/sidebar/aurora-restaurant/ingredientes/ingredientes.component';
import { MovimientoComponent } from './components/sidebar/aurora-restaurant/movimiento/movimiento.component';
import { StockComponent } from './components/sidebar/aurora-restaurant/reportes/ingredientes/stock/stock.component';
import { VentasComponent } from './components/sidebar/aurora-restaurant/reportes/ingredientes/ventas/ventas.component';

/**
 * Componentes de Aurora Contable
 */
import { VenderComponent } from './components/sidebar/aurora-contable/tienda/vender/vender.component';
import { ComprarComponent } from './components/sidebar/aurora-contable/tienda/comprar/comprar.component';
import { IngresosComponent } from './components/sidebar/aurora-contable/movimientos/ingresos/ingresos.component';
import { EgresosComponent } from './components/sidebar/aurora-contable/movimientos/egresos/egresos.component';
import { AbonosComponent } from './components/sidebar/aurora-contable/contabilidad/abonos/abonos.component';
import { CuentasPorCobrarComponent } from './components/sidebar/aurora-contable/contabilidad/cuentas-por-cobrar/cuentas-por-cobrar.component';
import { CuentasPorPagarComponent } from './components/sidebar/aurora-contable/contabilidad/cuentas-por-pagar/cuentas-por-pagar.component';
import { ContableComponent } from './components/sidebar/aurora-contable/reportes/contable/contable.component';
import { LineasComponent } from './components/sidebar/aurora-contable/gestion/lineas/lineas.component';
import { MarcasComponent } from './components/sidebar/aurora-contable/gestion/marcas/marcas.component';
import { ClientesComponent } from './components/sidebar/aurora-contable/gestion/clientes/clientes.component';
import { ProveedoresComponent } from './components/sidebar/aurora-contable/gestion/proveedores/proveedores.component';
import { PuntosDeEmisionComponent } from './components/sidebar/aurora-contable/configuracion/facturacion/puntos-de-emision/puntos-de-emision.component';
import { EstablecimientosComponent } from './components/sidebar/aurora-contable/configuracion/facturacion/establecimientos/establecimientos.component';
import { CategoriasComponent as CategoriasComponentAuroraContable } from './components/sidebar/aurora-contable/gestion/categorias/categorias.component';
import { ProductosComponent as ProductosComponentAuroraContable } from './components/sidebar/aurora-contable/gestion/productos/productos.component';
import { StockComponent as StockComponentAuroraContable } from './components/sidebar/aurora-contable/reportes/stock/stock.component';
import { PerfilComponent } from './components/sidebar/aurora-contable/configuracion/facturacion/perfil/perfil.component';
import { FacturasComponent } from './components/sidebar/aurora-contable/reportes/facturas/facturas/facturas.component';
import { MovimientosComponent } from './components/sidebar/aurora-contable/contabilidad/movimientos/movimientos.component';

@NgModule({
  providers: [
    DatePipe
  ],
  declarations: [
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    NavComponent,

    // Aurora Administrativo
    UsuariosComponent,
    RolesComponent,
    ModulosComponent,
    SubmodulosComponent,
    ItemsComponent,
    EmpresasComponent,
    AplicacionesComponent,

    //Aurora Restaurant
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

    //Aurora Contable
    VenderComponent,
    ComprarComponent,
    IngresosComponent,
    EgresosComponent,
    AbonosComponent,
    CuentasPorCobrarComponent,
    CuentasPorPagarComponent,
    ContableComponent,
    StockComponentAuroraContable,
    CategoriasComponentAuroraContable,
    ProductosComponentAuroraContable,
    LineasComponent,
    MarcasComponent,
    ClientesComponent,
    ProveedoresComponent,
    PuntosDeEmisionComponent,
    EstablecimientosComponent,
    PerfilComponent,
    SpinnerComponentComponent,
    FacturasComponent,
    MovimientosComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    NgSelectModule
  ],
  exports:[
    HomeComponent,
    HeaderComponent,
    FooterComponent
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})

export class AuroraModule { }
