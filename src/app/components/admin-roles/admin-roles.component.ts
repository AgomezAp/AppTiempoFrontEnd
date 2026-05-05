import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, MODULOS_SISTEMA } from '../../services/roles.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';

interface GrupoModulo { nombre: string; modulos: typeof MODULOS_SISTEMA; }

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.css']
})
export class AdminRolesComponent implements OnInit {
  roles: any[] = [];
  cargando = true;

  // Modal crear/renombrar rol
  modalRol = false;
  editandoRol: any = null;
  nombreRol = '';
  guardando = false;

  // Panel de permisos de módulos
  rolSeleccionado: any = null;
  tabActivo: 'modulos' | 'miembros' = 'modulos';
  cargandoModulos = false;
  modulosHabilitados: Set<string> = new Set();
  gruposModulos: GrupoModulo[] = [];

  // Panel de miembros
  usuariosRol: any[] = [];
  cargandoMiembros = false;

  // Modal asignar usuario al rol
  modalAsignar = false;
  todosUsuarios: any[] = [];
  cargandoTodosUsuarios = false;
  buscadorUsuarios = '';
  asignandoUid: number | null = null;

  readonly MODULOS = MODULOS_SISTEMA;
  readonly ROLES_PROTEGIDOS = ['Admin', 'User', 'Tecnologia'];

  constructor(private rolesService: RolesService, private userService: UserService) {}

  ngOnInit(): void {
    this.buildGrupos();
    this.cargar();
  }

  buildGrupos(): void {
    const map = new Map<string, typeof MODULOS_SISTEMA>();
    for (const m of MODULOS_SISTEMA) {
      if (!map.has(m.grupo)) map.set(m.grupo, []);
      map.get(m.grupo)!.push(m);
    }
    this.gruposModulos = Array.from(map.entries()).map(([nombre, modulos]) => ({ nombre, modulos }));
  }

  cargar(): void {
    this.cargando = true;
    this.rolesService.listarRoles().subscribe({
      next: (data: any[]) => { this.roles = data; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  abrirCrear(): void {
    this.editandoRol = null;
    this.nombreRol = '';
    this.modalRol = true;
  }

  abrirEditar(rol: any): void {
    this.editandoRol = rol;
    this.nombreRol = rol.Rname;
    this.modalRol = true;
  }

  guardarRol(): void {
    if (!this.nombreRol.trim()) return;
    this.guardando = true;
    const obs = this.editandoRol
      ? this.rolesService.actualizarNombreRol(this.editandoRol.Rid, this.nombreRol)
      : this.rolesService.crearRol(this.nombreRol);

    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.modalRol = false;
        this.cargar();
        if (!this.editandoRol) {
          setTimeout(() => {
            const nuevo = this.roles.find(r => r.Rname === this.nombreRol);
            if (nuevo) this.seleccionarRol(nuevo);
          }, 400);
        }
      },
      error: (err: any) => {
        Swal.fire('Error', err.error?.msg || 'No se pudo guardar el rol.', 'error');
        this.guardando = false;
      }
    });
  }

  eliminarRol(rol: any): void {
    if (this.ROLES_PROTEGIDOS.includes(rol.Rname)) {
      Swal.fire('No permitido', `El rol "${rol.Rname}" es de sistema y no puede eliminarse.`, 'warning');
      return;
    }
    Swal.fire({
      title: `¿Eliminar rol "${rol.Rname}"?`,
      text: 'Se eliminarán también todos sus permisos configurados.',
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(r => {
      if (r.isConfirmed) {
        this.rolesService.eliminarRol(rol.Rid).subscribe({
          next: () => {
            if (this.rolSeleccionado?.Rid === rol.Rid) this.rolSeleccionado = null;
            this.cargar();
          },
          error: (err: any) => Swal.fire('Error', err.error?.msg || 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  seleccionarRol(rol: any): void {
    if (this.rolSeleccionado?.Rid === rol.Rid) {
      this.rolSeleccionado = null;
      this.tabActivo = 'modulos';
      return;
    }
    this.rolSeleccionado = rol;
    this.tabActivo = 'modulos';
    this.cargandoModulos = true;
    this.modulosHabilitados = new Set();
    this.rolesService.getModulosRol(rol.Rid).subscribe({
      next: (data: any) => {
        this.modulosHabilitados = new Set(
          data.modulos.filter((m: any) => m.habilitado).map((m: any) => m.modulo)
        );
        this.cargandoModulos = false;
      },
      error: () => this.cargandoModulos = false
    });
    this.cargarUsuariosRol(rol.Rid);
  }

  cargarUsuariosRol(rid: number): void {
    this.cargandoMiembros = true;
    this.rolesService.getUsuariosRol(rid).subscribe({
      next: (data: any[]) => { this.usuariosRol = data; this.cargandoMiembros = false; },
      error: () => this.cargandoMiembros = false
    });
  }

  abrirModalAsignar(): void {
    this.modalAsignar = true;
    this.buscadorUsuarios = '';
    this.cargandoTodosUsuarios = true;
    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => { this.todosUsuarios = data; this.cargandoTodosUsuarios = false; },
      error: () => this.cargandoTodosUsuarios = false
    });
  }

  get usuariosFiltrados(): any[] {
    const q = this.buscadorUsuarios.toLowerCase().trim();
    if (!q) return this.todosUsuarios;
    return this.todosUsuarios.filter(u =>
      `${u.name} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  asignarRol(usuario: any): void {
    if (this.asignandoUid !== null || !this.rolSeleccionado) return;
    this.asignandoUid = usuario.Uid;
    this.userService.updateUser(usuario.Uid, { Rid: this.rolSeleccionado.Rid }).subscribe({
      next: () => {
        this.asignandoUid = null;
        // Actualiza datos locales en el modal
        usuario.Rid = this.rolSeleccionado.Rid;
        usuario.role = { Rid: this.rolSeleccionado.Rid, Rname: this.rolSeleccionado.Rname };
        // Refresca la lista de miembros
        this.cargarUsuariosRol(this.rolSeleccionado.Rid);
        Swal.fire({
          icon: 'success',
          title: 'Rol asignado',
          text: `${usuario.name} ${usuario.lastName} ahora tiene el rol "${this.rolSeleccionado.Rname}".`,
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        this.asignandoUid = null;
        Swal.fire('Error', err.error?.msg || 'No se pudo asignar el rol.', 'error');
      }
    });
  }

  toggleModulo(key: string): void {
    if (this.modulosHabilitados.has(key)) this.modulosHabilitados.delete(key);
    else this.modulosHabilitados.add(key);
  }

  todosGrupoHabilitados(grupo: GrupoModulo): boolean {
    return grupo.modulos.every((m: any) => this.modulosHabilitados.has(m.key));
  }

  toggleGrupo(grupo: GrupoModulo): void {
    const todos = this.todosGrupoHabilitados(grupo);
    for (const m of grupo.modulos) {
      if (todos) this.modulosHabilitados.delete(m.key);
      else this.modulosHabilitados.add(m.key);
    }
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionado) return;
    this.rolesService.actualizarModulosRol(
      this.rolSeleccionado.Rid,
      Array.from(this.modulosHabilitados)
    ).subscribe({
      next: () => Swal.fire('Guardado', 'Permisos actualizados correctamente.', 'success'),
      error: () => Swal.fire('Error', 'No se pudieron guardar los permisos.', 'error')
    });
  }

  iniciales(u: any): string {
    return `${(u.name || '?')[0]}${(u.lastName || '?')[0]}`.toUpperCase();
  }

  modulosHabCount(rol: any): number {
    return rol.modulos?.length || 0;
  }

  esProtegido(rol: any): boolean {
    return this.ROLES_PROTEGIDOS.includes(rol.Rname);
  }
}
