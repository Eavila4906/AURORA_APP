import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CrearOrdenComponent } from './orden/crear-orden/crear-orden.component';
import { OrdenPendienteComponent } from './orden/orden-pendiente/orden-pendiente.component';
import { DetallesOrdenComponent } from './orden/detalles-orden/detalles-orden.component';
import { OrdenPagadaComponent } from './orden/orden-pagada/orden-pagada.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { ProductosComponent } from './productos/productos.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { IngredientesComponent } from './ingredientes/ingredientes.component';
import { MovimientoComponent } from './movimiento/movimiento.component';
import { GeneralComponent } from './reportes/general/general/general.component';
import { ComercialComponent } from './reportes/comercial/comercial/comercial.component';
import { VentasComponent } from './reportes/ingredientes/ventas/ventas.component';
import { StockComponent } from './reportes/ingredientes/stock/stock.component';
import { BaseComponent } from 'src/app/aurora/base/base.component';

const routes: Routes = [
  {
    path: 'ordenes', component: BaseComponent, 
    children: [
      { path: 'crear', component: CrearOrdenComponent },
      { path: 'pendientes', component: OrdenPendienteComponent },
      { path: 'pendientes/detalles/:id-factura', component: DetallesOrdenComponent },
      { path: 'pagadas', component: OrdenPagadaComponent },
    ]
  },
  {
    path: '', component: BaseComponent, 
    children: [
      { path: 'delivery', component: DeliveryComponent },
    ]
  },
  {
    path: 'gestion_productos', component: BaseComponent, 
    children: [
      { path: 'productos', component: ProductosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'ingredientes', component: IngredientesComponent },
    ]
  },
  {
    path: 'gestion_existencia', component: BaseComponent, 
    children: [
      { path: 'movimientos', component: MovimientoComponent }
    ]
  },
  {
    path: 'reportes', component: BaseComponent, 
    children: [
      { path: 'general', component: GeneralComponent },
      { path: 'comercial', component: ComercialComponent },
      { path: 'ingrediente-ventas', component: VentasComponent },
      { path: 'ingrediente-stocks', component: StockComponent },
      { path: 'ingrediente-stocks/crear', component: StockComponent },
    ]
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class RestaurantRoutingModule { }
