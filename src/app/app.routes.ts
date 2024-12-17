import { Routes } from '@angular/router';

import {
  AccesDeniedComponent,
} from './components/acces-denied/acces-denied.component';
import {
  AddProductComponent,
} from './components/add-product/add-product.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {
  DeleteProductComponent,
} from './components/delete-product/delete-product.component';
import {
  EditProductComponent,
} from './components/edit-product/edit-product.component';
import {
  ErrorPageComponent,
} from './components/error-page/error-page.component';
import { HorasComponent } from './components/horas/horas.component';
import { LoginComponent } from './components/login/login.component';
import {
  MantenimientoComponent,
} from './components/mantenimiento/mantenimiento.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { tRolGuard } from './utils/t-rol.guard';

export const routes: Routes = [
  {
    path: '', component: LoginComponent
  },
  {
    path: 'logIn', component: LoginComponent
  },
  {
    path: 'signup', component: SignInComponent
  },
  {
    path: 'dashBoard', component: DashboardComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] }
  },
  {
    path: 'mantenimiento', component: MantenimientoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User','Tecnologia'] }
  },
  {
    path: 'errorPage', component: ErrorPageComponent
  },
  {
    path: 'horas', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] } 
  },
  {
    path: 'access-denied', component: AccesDeniedComponent,canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] }  // Página de acceso denegado
  },
  {
    path: 'add-product', component: AddProductComponent,canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] }  // Página para agregar productos
  },
  {
    path: 'edit-product/:id', component: EditProductComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } // Página para editar productos
  },
  {
    path: 'delete-product/:id', component: DeleteProductComponent,canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] }  // Página para eliminar productos
  },
  { path: '**', component: ErrorPageComponent } 
  // otras rutas
];