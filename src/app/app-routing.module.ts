import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministracionRoutingModule } from './aurora/components/sidebar/aurora-administrativo/administracion-routing.module';
import { RestaurantRoutingModule } from './aurora/components/sidebar/aurora-restaurant/restaurant-routing.module';
import { AuroraContableRoutingModule } from './aurora/components/sidebar/aurora-contable/aurora-contable-routing.module';
import { AuthRoutingModule } from './auth/auth-routing.module';
import { AuroraRoutingModule } from './aurora/aurora-routing.module';

import { NotFoundComponent } from './errors/NotFound/not-found/not-found.component';

const routes: Routes = [
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AuthRoutingModule,
    AuroraRoutingModule,
    AdministracionRoutingModule,
    RestaurantRoutingModule,
    AuroraContableRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
