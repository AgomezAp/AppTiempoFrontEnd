import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

const SYSTEM_ROLES = ['Admin', 'User', 'Tecnologia'];

const MODULE_ROUTE_MAP: Record<string, string> = {
  horas:                   '/horas',
  novedades:               '/novedad',
  permisos:                '/permisos',
  usuarios:                '/admin',
  admin_roles:             '/admin-roles',
  recursos:                '/gestion-archivos',
  ssgt:                    '/ssgt-dashboard',
  rrhh_contratos:          '/contratos',
  rrhh_hoja_vida:          '/hoja-vida',
  rrhh_evaluaciones:       '/evaluaciones',
  inventario_dispositivos: '/inventario',
  inventario_mobiliario:   '/inventario-mobiliario',
  inventario_aseo:         '/inventario-aseo',
  inventario_papeleria:    '/inventario-papeleria',
  inventario_botiquin:     '/inventario-botiquin',
  inventario_desechables:  '/inventario-desechables',
  inventario_dotacion:     '/inventario-dotacion',
  inventario_herramientas: '/inventario-herramientas',
};

@Injectable({
  providedIn: 'root'
})
export class tRolGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (!role) {
      this.router.navigate(['/logIn']);
      return false;
    }

    const isCustomRole = !SYSTEM_ROLES.includes(role);

    if (isCustomRole) {
      // Roles personalizados: verificar por módulos habilitados
      const modulesStr = localStorage.getItem('modulos');
      const modules: string[] = modulesStr ? JSON.parse(modulesStr) : [];
      const requiredModule: string | undefined = route.data?.['modulo'];

      // Ruta sin requerimiento de módulo = accesible para todos los autenticados
      if (!requiredModule) return true;

      if (modules.includes(requiredModule)) return true;

      // Sin acceso: redirigir al primer módulo disponible
      let redirect = '/access-denied';
      for (const mod of modules) {
        const base = MODULE_ROUTE_MAP[mod];
        if (base) {
          redirect = (mod === 'horas' || mod === 'rrhh_hoja_vida')
            ? `${base}/${userId}`
            : base;
          break;
        }
      }
      this.router.navigate([redirect]);
      return false;
    }

    // Roles de sistema: lógica original con allowedRoles
    const allowedRoles = route.data?.['allowedRoles'];

    if (allowedRoles && allowedRoles.includes(role)) {
      if (role === 'User' && route.params['id']) {
        const routeId = route.params['id'];
        if (routeId !== userId) {
          this.router.navigate(['/horas', userId]);
          return false;
        }
      }
      return true;
    } else {
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}