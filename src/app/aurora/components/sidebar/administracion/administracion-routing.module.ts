import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BaseComponent } from 'src/app/aurora/base/base.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { RolesComponent } from './roles/roles.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { ModulosComponent } from './modulacion/modulos/modulos.component';
import { SubmodulosComponent } from './modulacion/submodulos/submodulos.component';
import { ItemsComponent } from './modulacion/items/items.component';

const routes: Routes = [
  {
    path: 'administracion', component: BaseComponent, 
    children: [
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'roles&permisos', component: RolesComponent },
      { 
        path: 'modulacion', children: [
          { path: 'modulos', component: ModulosComponent },
          { path: 'submodulos', component: SubmodulosComponent },
          { path: 'items', component: ItemsComponent }
        ]
      },
      { path: 'empresas', component: EmpresasComponent },
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
export class AdministracionRoutingModule { }
