import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-acces-denied',
  imports: [],
  templateUrl: './acces-denied.component.html',
  styleUrl: './acces-denied.component.css'
})
export class AccesDeniedComponent {
  constructor(private router: Router) { }

  ngOnInit(): void {
    const role = localStorage.getItem('role') || '';
    const isCustomRole = !SYSTEM_ROLES.includes(role);
    if (!isCustomRole) {
      // Solo roles de sistema tienen auto-redirect a horas
      setTimeout(() => this.navigateHome(), 3000);
    }
    // Roles personalizados sin módulos no se redirigen solos para evitar bucles
  }

  redirectToHoras(): void {
    this.navigateHome();
  }

  navigateHome(): void {
    const role = localStorage.getItem('role') || '';
    const userId = localStorage.getItem('userId');
    const isCustomRole = !SYSTEM_ROLES.includes(role);

    if (isCustomRole) {
      const modulesStr = localStorage.getItem('modulos');
      const modules: string[] = modulesStr ? JSON.parse(modulesStr) : [];
      for (const mod of modules) {
        const base = MODULE_ROUTE_MAP[mod];
        if (base) {
          const route = (mod === 'horas' || mod === 'rrhh_hoja_vida')
            ? `${base}/${userId}`
            : base;
          this.router.navigate([route]);
          return;
        }
      }
      // Sin módulos: cerrar sesión
      localStorage.clear();
      this.router.navigate(['/logIn']);
    } else {
      this.router.navigate([`/horas/${userId}`]);
    }
  }
}
