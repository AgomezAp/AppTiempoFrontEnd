import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { NominaConfigService } from '../../services/nomina-config.service';
import { NominaConfig } from '../../interfaces/nomina-config';

@Component({
  selector: 'app-configuracion-nomina',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './configuracion-nomina.component.html',
  styleUrls: ['./configuracion-nomina.component.css']
})
export class ConfiguracionNominaComponent implements OnInit {
  configVigente: NominaConfig | null = null;
  historialConfigs: NominaConfig[] = [];
  
  // Formulario
  formulario: Partial<NominaConfig> = {
    salarioMinimo: 0,
    auxilioTransporte: 0,
    porcentajeSalud: 0.04,
    porcentajePension: 0.04,
    anio: new Date().getFullYear(),
    vigente: false
  };

  editMode = false;
  editingId: number | null = null;
  cargando = false;
  mensaje = '';
  error = '';
  mostrarHistorial = false;

  constructor(private nominaConfigService: NominaConfigService) {}

  ngOnInit() {
    this.cargarConfigVigente();
    this.cargarHistorial();
  }

  cargarConfigVigente() {
    this.cargando = true;
    this.nominaConfigService.getConfigVigente().subscribe({
      next: (config) => {
        this.configVigente = config;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando configuración vigente:', err);
        this.error = 'Error al cargar la configuración actual';
        this.cargando = false;
      }
    });
  }

  cargarHistorial() {
    this.nominaConfigService.getAllConfigs().subscribe({
      next: (configs) => {
        this.historialConfigs = configs;
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
      }
    });
  }

  editarConfigVigente() {
    if (this.configVigente) {
      this.formulario = {
        salarioMinimo: this.configVigente.salarioMinimo,
        auxilioTransporte: this.configVigente.auxilioTransporte,
        porcentajeSalud: this.configVigente.porcentajeSalud,
        porcentajePension: this.configVigente.porcentajePension,
        anio: this.configVigente.anio,
        vigente: this.configVigente.vigente
      };
      this.editingId = this.configVigente.id || null;
      this.editMode = true;
    }
  }

  guardarConfig() {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    // Validaciones
    if (!this.formulario.salarioMinimo || !this.formulario.auxilioTransporte || !this.formulario.anio) {
      this.error = 'Todos los campos son requeridos';
      this.cargando = false;
      return;
    }

    if (this.editMode && this.editingId) {
      // Actualizar configuración existente
      this.nominaConfigService.updateConfig(this.editingId, this.formulario).subscribe({
        next: (config) => {
          this.mensaje = 'Configuración actualizada correctamente';
          this.configVigente = config;
          this.cargarHistorial();
          this.cancelarEdicion();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error actualizando:', err);
          this.error = 'Error al actualizar la configuración';
          this.cargando = false;
        }
      });
    } else {
      // Crear nueva configuración
      this.nominaConfigService.createConfig(this.formulario).subscribe({
        next: (config) => {
          this.mensaje = 'Nueva configuración creada correctamente';
          if (config.vigente) {
            this.configVigente = config;
          }
          this.cargarHistorial();
          this.resetFormulario();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error creando:', err);
          this.error = 'Error al crear la configuración';
          this.cargando = false;
        }
      });
    }
  }

  activarConfig(id: number) {
    if (confirm('¿Estás seguro de activar esta configuración? Se desactivará la actual.')) {
      this.cargando = true;
      this.nominaConfigService.toggleVigencia(id).subscribe({
        next: (config) => {
          this.mensaje = 'Configuración activada correctamente';
          this.configVigente = config;
          this.cargarHistorial();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error activando:', err);
          this.error = 'Error al activar la configuración';
          this.cargando = false;
        }
      });
    }
  }

  eliminarConfig(id: number) {
    if (confirm('¿Estás seguro de eliminar esta configuración? Esta acción no se puede deshacer.')) {
      this.cargando = true;
      this.nominaConfigService.deleteConfig(id).subscribe({
        next: () => {
          this.mensaje = 'Configuración eliminada correctamente';
          this.cargarHistorial();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error eliminando:', err);
          this.error = err.error?.error || 'Error al eliminar la configuración';
          this.cargando = false;
        }
      });
    }
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editingId = null;
    this.resetFormulario();
  }

  resetFormulario() {
    this.formulario = {
      salarioMinimo: 0,
      auxilioTransporte: 0,
      porcentajeSalud: 0.04,
      porcentajePension: 0.04,
      anio: new Date().getFullYear(),
      vigente: false
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }
}
