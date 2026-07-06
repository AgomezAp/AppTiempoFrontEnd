import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { PlantillaInventarioService } from '../../services/plantilla-inventario.service';

@Component({
  selector: 'app-mi-inventario',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SpinnerComponent],
  templateUrl: './mi-inventario.component.html',
  styleUrl: './mi-inventario.component.css',
})
export class MiInventarioComponent implements OnInit {
  inventarios: any[] = [];
  loading = false;
  expandido: number | null = null;

  private uid: number = 0;

  constructor(private plantillaService: PlantillaInventarioService) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.uid = payload.id || 0;
      }
    } catch { this.uid = 0; }
  }

  ngOnInit() {
    if (!this.uid) return;
    this.loading = true;
    this.plantillaService.getInventariosUsuario(this.uid).subscribe({
      next: data => { this.inventarios = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggleExpandir(id: number) {
    this.expandido = this.expandido === id ? null : id;
  }

  get inventariosActivos() {
    return this.inventarios.filter(i => i.estado === 'activo');
  }

  totalItems(inv: any): number {
    return (inv.plantilla?.items || []).reduce((sum: number, i: any) => sum + (i.cantidad || 0), 0);
  }

  get totalItemsGlobal(): number {
    return this.inventariosActivos.reduce((sum, inv) => sum + this.totalItems(inv), 0);
  }

  iconoCategoria(cat: string): string {
    const map: Record<string, string> = {
      dispositivo: 'bi-laptop',
      consumible: 'bi-bag',
      mobiliario: 'bi-house',
      otro: 'bi-box-seam',
    };
    return map[cat] || 'bi-box-seam';
  }

  colorCategoria(cat: string): string {
    const map: Record<string, string> = {
      dispositivo: '#1a3560',
      consumible: '#2e7d32',
      mobiliario: '#6a1b9a',
      otro: '#e65100',
    };
    return map[cat] || '#546e7a';
  }
}
