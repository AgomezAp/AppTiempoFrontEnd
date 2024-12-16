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

    if (!role) {
      this.router.navigate(['/logIn']); // Redirige al login si no hay rol
      return false;
    }

    const allowedRoles = route.data?.['allowedRoles'];

    // Verifica si el rol del usuario permite el acceso
    if (allowedRoles && allowedRoles.includes(role)) {
      return true; // Permite el acceso si el usuario tiene uno de los roles permitidos
    } else {
      this.router.navigate(['/access-denied']); // Redirige si no tiene un rol permitido
      return false;
    }
  }
}