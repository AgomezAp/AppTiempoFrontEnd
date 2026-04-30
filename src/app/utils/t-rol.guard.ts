import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class tRolGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const role = localStorage.getItem('role'); // Obtener el rol del localStorage
    const userId = localStorage.getItem('userId');

    if (!role) {
      this.router.navigate(['/logIn']); // Redirige al login si no hay rol
      return false;
    }

    const allowedRoles = route.data?.['allowedRoles'];

    // Roles predefinidos del sistema
    const SYSTEM_ROLES = ['Admin', 'User', 'Tecnologia'];
    // Los roles personalizados creados por el admin se tratan como 'User'
    const isCustomRole = !SYSTEM_ROLES.includes(role);
    const effectiveRole = isCustomRole ? 'User' : role;

    // Verifica si el rol del usuario permite el acceso
    if (allowedRoles && allowedRoles.includes(effectiveRole)) {
      if (effectiveRole === 'User' && route.params['id']) {
        const routeId = route.params['id'];

        if (routeId !== userId) {
          this.router.navigate(['/horas', userId])
          return false;
        } 
      }
      return true
    } else {
      this.router.navigate(['/access-denied']); // Redirige si no tiene un rol permitido
      return false;
    }
  }
}