import { Routes } from '@angular/router';

import {
  AccesDeniedComponent,
} from './components/acces-denied/acces-denied.component';
import {
  AddProductComponent,
} from './components/add-product/add-product.component';
import { AdminComponent } from './components/admin/admin.component';
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
import { PermisoComponent } from './components/permiso/permiso.component';
import {
  ResetPasswordComponent,
} from './components/reset-password/reset-password.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { UploadComponent } from './components/upload/upload.component';
import { tRolGuard } from './utils/t-rol.guard';
import { EditSalidaComponent } from './components/edit-salida/edit-salida.component';
import { InformesComponent } from './components/informes/informes.component';
import { NovedadesComponent } from './components/novedades/novedades.component';
import { VerNovedadComponent } from './components/ver-novedad/ver-novedad.component'
import { NuevoRegistroComponent } from './components/nuevo-registro/nuevo-registro.component';
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
    path: 'reestablecerContraseña', component: ResetPasswordComponent
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
    path: 'horas/:id', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] } 
  },
  {
    path: 'horas/:fecha', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] } 
  },
  {
    path: 'editar-salida/:id/:fecha', component: EditSalidaComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] }
  },
  {
    path: 'editar-entrada/:id/:fecha', component: EditSalidaComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia']}
  },
  {
    path: 'nuevoRegistro', component: NuevoRegistroComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia']}
  },
  {
    path: 'informes', component: InformesComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] }
  },
  {
    path: 'crearNovedad', component: NovedadesComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia']}
  },
  {
    path: 'verNovedad', component: VerNovedadComponent, canActivate: [tRolGuard], data: {allowedRoles: ['Admin', 'User', 'Tecnologia']}
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
  { 
    path: 'subirArchivo', component: UploadComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } // Página para subir archivos
  },
  { path: 'permisos', component: PermisoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } },
  { path: 'admin', component: AdminComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  { path: '**', component: ErrorPageComponent },
];