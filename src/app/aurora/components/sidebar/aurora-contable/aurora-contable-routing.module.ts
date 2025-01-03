import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmNavigationGuard } from 'src/app/aurora/guards/confirm-navigation.guard';

import { BaseComponent } from 'src/app/aurora/base/base.component';
import { VenderComponent } from './tienda/vender/vender.component';
import { ComprarComponent } from './tienda/comprar/comprar.component';
import { IngresosComponent } from './movimientos/ingresos/ingresos.component';
import { EgresosComponent } from './movimientos/egresos/egresos.component';
import { AbonosComponent } from './contabilidad/abonos/abonos.component';
import { CuentasPorCobrarComponent } from './contabilidad/cuentas-por-cobrar/cuentas-por-cobrar.component';
import { CuentasPorPagarComponent } from './contabilidad/cuentas-por-pagar/cuentas-por-pagar.component';
import { ContableComponent } from './reportes/contable/contable.component';
import { StockComponent } from './reportes/stock/stock.component';
import { CategoriasComponent } from './gestion/categorias/categorias.component';
import { LineasComponent } from './gestion/lineas/lineas.component';
import { MarcasComponent } from './gestion/marcas/marcas.component';
import { ClientesComponent } from './gestion/clientes/clientes.component';
import { ProveedoresComponent } from './gestion/proveedores/proveedores.component';
import { ProductosComponent } from './gestion/productos/productos.component';
import { PerfilComponent } from './configuracion/facturacion/perfil/perfil.component';
import { EstablecimientosComponent } from './configuracion/facturacion/establecimientos/establecimientos.component';
import { PuntosDeEmisionComponent } from './configuracion/facturacion/puntos-de-emision/puntos-de-emision.component';
import { FacturasComponent } from './reportes/facturas/facturas/facturas.component';
import { MovimientosComponent } from './contabilidad/movimientos/movimientos.component';
import { SistemaComponent } from './configuracion/sistema/sistema.component';
import { NuevaComponent } from './ordenes-de-trabajo/nueva/nueva.component';
import { PendientesComponent } from './ordenes-de-trabajo/pendientes/pendientes.component';
import { AtendidasComponent } from './ordenes-de-trabajo/atendidas/atendidas.component';
import { ConfigurarComponent } from './ordenes-de-trabajo/turnos/configurar/configurar.component';

const routes: Routes = [
  {
    path: 'tienda', component: BaseComponent, 
    children: [
      { path: 'vender', component: VenderComponent, canDeactivate: [ConfirmNavigationGuard] },
      { path: 'comprar', component: ComprarComponent },
    ]
  },
  {
    path: 'ordenes', component: BaseComponent, 
    children: [
      { path: 'nueva', component: NuevaComponent, canDeactivate: [ConfirmNavigationGuard] },
      { path: 'pendientes', component: PendientesComponent },
      { path: 'atendidas', component: AtendidasComponent },
      { 
        path: 'turnos', children: [
          { path: 'configurar', component: ConfigurarComponent }
        ]
      },
    ]
  },
  {
    path: 'inventario', component: BaseComponent, 
    children: [
      { path: 'ingresos', component: IngresosComponent },
      { path: 'egresos', component: EgresosComponent },
    ]
  },
  {
    path: 'contabilidad', component: BaseComponent, 
    children: [
      { path: 'abonos', component: AbonosComponent },
      { path: 'cuentas-por-cobrar', component: CuentasPorCobrarComponent },
      { path: 'cuentas-por-pagar', component: CuentasPorPagarComponent },
      { path: 'movimientos', component: MovimientosComponent },
    ]
  },
  {
    path: 'reportes', component: BaseComponent, 
    children: [
      { path: 'contable', component: ContableComponent },
      { path: 'stock', component: StockComponent },
      { path: 'facturas', component: FacturasComponent },
    ]
  },
  {
    path: 'gestion', component: BaseComponent, 
    children: [
      { path: 'categorias', component: CategoriasComponent },
      { path: 'lineas', component: LineasComponent },
      { path: 'marcas', component: MarcasComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'proveedores', component: ProveedoresComponent },
      { path: 'productos', component: ProductosComponent },
    ]
  },
  {
    path: 'configuracion', component: BaseComponent, 
    children: [
      { 
        path: 'facturacion', children: [
          { path: 'perfil', component: PerfilComponent },
          { path: 'establecimientos', component: EstablecimientosComponent },
          { path: 'puntos-de-emision', component: PuntosDeEmisionComponent },
        ]
      },
      { path: 'sistema', component: SistemaComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AuroraContableRoutingModule { }
