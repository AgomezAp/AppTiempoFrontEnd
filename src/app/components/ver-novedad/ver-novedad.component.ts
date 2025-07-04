import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, mapToResolve, Router } from '@angular/router';
import { NovedadService } from '../../services/novedad.service';
import { Novedad } from '../../interfaces/hora';
import { response } from 'express';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-ver-novedad',
  imports: [
    NavbarComponent,
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  templateUrl: './ver-novedad.component.html',
  styleUrl: './ver-novedad.component.css',
})
export class VerNovedadComponent {
  dateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
  loading: boolean = true;
  listNovedad: Novedad[] = [];
  filteredNovedad: Novedad[] = [];
  showList: boolean = true;
  filterName: string = '';
  fecha: string = '';
  horas: string = '';
  id: number = 0;
  editandoHoras: any = {};
  horasTemp: any = {};
  errorMesssage: { [key: number]: string } = {};

  // Propiedades nuevas para el formulario
  tipo: string = ''; // Tipo de informe seleccionado
  name: string = ''; // Nombre seleccionado
  usuarios: Array<{ nombre: string }> = []; // Lista de usuarios
  nombres: string[] = []; // Lista de nombres seleccionados
  fechaInicial: string = ''; // Fecha de inicio
  fechaFinal: string = ''; // Fecha de fin

  constructor(
    private router: Router,
    private novedadService: NovedadService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.showList = true;
    this.loadNovedad();
    this.usuarios = this.loadUsuarios(); // Simulación de carga de usuarios
  }

  // Método para cargar usuarios (simulado)
  loadUsuarios(): Array<{ nombre: string }> {
    return [
      { nombre: 'Usuario 1' },
      { nombre: 'Usuario 2' },
      { nombre: 'Usuario 3' },
    ];
  }

  // Método para seleccionar el tipo de informe
  seleccionarTipoInforme(tipo: string): void {
    this.tipo = tipo;
  }

  // Método para manejar el cambio de nombre
  onNombreChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.name = target.value;
  }

  // Método para agregar un nombre a la lista
  agregarNombre(): void {
    if (this.name && !this.nombres.includes(this.name)) {
      this.nombres.push(this.name);
    }
  }

  // Método para generar el informe
  generarInforme(): void {
    this.loading = true;
    // Simulación de generación de informe
    setTimeout(() => {
      this.loading = false;
      this.toastr.success('Informe generado con éxito');
    }, 2000);
  }

  // Método para cancelar la edición
  cancelEdit(): void {
    this.tipo = '';
    this.name = '';
    this.nombres = [];
    this.fechaInicial = '';
    this.fechaFinal = '';
  }

  // Métodos existentes
  loadNovedad(): void {
    this.loading = true;
    this.novedadService.verNovedad().subscribe((data: Novedad[]) => {
      this.listNovedad = data;
      this.filteredNovedad = data;
    });
  }

  filterdByName(): void {
    if (this.filterName) {
      this.filteredNovedad = this.listNovedad.filter((novedad) =>
        novedad.Name.toLowerCase().includes(this.filterName.toLowerCase())
      );
    } else {
      this.filteredNovedad = this.listNovedad;
    }
  }

  filterByData(): void {
    if (this.fecha) {
      const fecha = new Date(this.fecha).getTime();
      this.filteredNovedad = this.listNovedad.filter((novedad) => {
        const fechaN = new Date(novedad.Fecha).getTime();
        return fechaN === fecha;
      });
    } else {
      this.filteredNovedad = this.listNovedad;
    }
  }

  activarEdicion(novedad: Novedad): void {
    this.editandoHoras[novedad.Nid] = true;
    this.horasTemp[novedad.Nid] = novedad.horas;
  }

  validarYActualizarHora(id: number, horas: string): void {
    const regex = /^-?(0?[0-9]|1[0-9]|2[0-3]):(00|30)$/;
    if (regex.test(horas)) {
      this.novedadService.actualizaHora(id, horas).subscribe({
        next: (response) => {
          console.log('Hora actualizada', response);
          this.toastr.success('Hora actualizada exitosamente');
        },
        error: (err) => {
          console.error('Error al actualizar la hora', err);
        },
      });
    } else {
      console.warn('Formato de hora inválido');
      this.toastr.error('Por favor usa un formato correcto');
    }
  }

  crearNovedad(): void {
    this.novedadService.createNovedad().subscribe(
      (respuesta: Novedad) => {
        console.log('Novedad creada con éxito', respuesta);
        this.toastr.success('Novedades actualizadas');
        this.router.navigate(['/verNovedad']);
      },
      (error) => {
        console.error('Error al crear novedad', error);
        this.toastr.error(
          'Error al crear la novedad, inténtalo de nuevo más tarde'
        );
      }
    );
  }

  editarEstado(novedad: any, aceptacion: boolean | null): void {
    this.novedadService.actualizaEstado(novedad.id, aceptacion).subscribe({
      next: () => {
        novedad.aceptacion = aceptacion;
        novedad.editable = true;
      },
      error: (err) => {
        console.error('Error al actualizar', err);
      },
    });
  }

  enviarAceptacion(): void {
    this.novedadService.aceptar().subscribe({
      next: (response: Novedad) => {
        console.log(`Novedad aceptada:`, response);
        this.toastr.success('Novedades aceptadas exitosamente');
        this.loadNovedad();
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('Ninguna novedad para aceptar');
        } else if (err.status === 500) {
          this.toastr.error('Error al aceptar la novedad');
        }
      },
    });
  }
}
