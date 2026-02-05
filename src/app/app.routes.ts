import { Routes } from '@angular/router';

import {
  AccesDeniedComponent,
} from './components/acces-denied/acces-denied.component';

import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
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
import { NovedadComponent } from './components/novedades/novedades.component';
import { VerNovedadComponent } from './components/ver-novedad/ver-novedad.component'
import { NuevoRegistroComponent } from './components/nuevo-registro/nuevo-registro.component';
import { ExtraListComponent } from './components/extra-list/extra-list.component';
import { AusentismoComponent } from './components/ausentismo/ausentismo.component';
import { GestionArchivosComponent } from './components/gestion-archivos/gestion-archivos.component';
import { CertificadoLaboralComponent } from './components/certificado-laboral/certificado-laboral.component';
import { ConfiguracionNominaComponent } from './components/configuracion-nomina/configuracion-nomina.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { RegistroAsistenciaComponent } from './components/registro-asistencia/registro-asistencia.component';
import { FirmarAsistenciaComponent } from './components/firmar-asistencia/firmar-asistencia.component';

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
    path: 'horas', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } 
  },
  {
    path: 'horas/:id', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] } 
  },
  {
    path: 'horas/:fecha', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } 
  },
  {
    path: 'editar-salida/:id/:fecha', component: EditSalidaComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] }
  },
  {
    path: 'editar-entrada/:id/:fecha', component: EditSalidaComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'nuevoRegistro', component: NuevoRegistroComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'informes', component: InformesComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] }
  },
  {
    path: 'novedad', component: NovedadComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'verNovedad', component: VerNovedadComponent, canActivate: [tRolGuard], data: {allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'access-denied', component: AccesDeniedComponent,canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] }  // Página de acceso denegado
  },

  { 
    path: 'subirArchivo', component: UploadComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } // Página para subir archivos
  },
  {
    path: 'extras', component: ExtraListComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin']} //Pagina para ver las horas extras
  },
    {
      path: 'ausentismo', component: AusentismoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] }
    },
  { path: 'permisos', component: PermisoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } },
  { path: 'admin', component: AdminComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  
  // Nuevas rutas para gestión de archivos y certificados
  { 
    path: 'gestion-archivos', 
    component: GestionArchivosComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  { 
    path: 'mi-certificado', 
    component: CertificadoLaboralComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  { 
    path: 'configuracion-nomina', 
    component: ConfiguracionNominaComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin'] } 
  },
  { 
    path: 'reservas', 
    component: ReservasComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  
  // Rutas de Registro de Asistencia
  { 
    path: 'registro-asistencia', 
    component: RegistroAsistenciaComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin'] } 
  },
  // Ruta pública para firmar (sin guard)
  { 
    path: 'firmar-asistencia/:token', 
    component: FirmarAsistenciaComponent
  },
  
  { path: '**', component: ErrorPageComponent },
];