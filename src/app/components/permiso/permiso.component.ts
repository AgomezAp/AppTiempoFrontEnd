import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { PermisosService } from '../../services/permisos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { TipoPermisoService, TipoPermiso } from '../../services/tipo-permiso.service';

@Component({
  selector: 'app-permiso',
  imports: [CommonModule, FormsModule, SpinnerComponent, NavbarComponent],
  templateUrl: './permiso.component.html',
  styleUrl: './permiso.component.css',
})
export class PermisoComponent implements OnInit {
  permiso: any = {
    tipo: '',
    descripcion: '',
    fecha: new Date(),
    horas: 0,
    Uid: parseInt(localStorage.getItem('userId') || '0', 10),
    emailPersonal: localStorage.getItem('email') || '',
    emailLider: '',
    nombre:
      localStorage.getItem('name') + ' ' + localStorage.getItem('lastname'),
    numeroDocumento: localStorage.getItem('documentoIdentificacion') || '',
    horaSalida: '',
    horaEntrada: '',
    observaciones: '',
  };
  cantidadDias: number = 1;
  fechaFin: string = '';
  diasPagos: number | null = null;
  areaNombre: string = localStorage.getItem('area') || '';

  esGestionAdministrativa(): boolean {
    const area = this.areaNombre.toLowerCase();
    return area.includes('gestión administrativa') || area.includes('gestion administrativa');
  }

  esVacacionesMasPagos(): boolean {
    return this.permiso.tipo?.toLowerCase().trim() === 'vacaciones más pagos';
  }

  ngOnInit(): void {
    const correoLider = localStorage.getItem('correoLider');
    if (correoLider) {
      this.permiso.emailLider = correoLider === this.permiso.emailPersonal ? '' : correoLider;
    }
    this.loadHolidays();
    this.tipoPermisoService.getActivos().subscribe({
      next: (tipos) => {
        this.tiposPermisoConfig = tipos;
        this.tiposPermiso = tipos.map(t => t.nombre);
        this.permitidosSalida = tipos.filter(t => t.requiere_horas).map(t => t.nombre);
        this.permitidoEntrada = tipos.filter(t => t.requiere_horas).map(t => t.nombre);
        this.variosDias = tipos.filter(t => t.requiere_fecha_fin).map(t => t.nombre);
      },
      error: () => { /* mantiene los valores hardcodeados como fallback */ },
    });
  }
  transformHora() {
    const pipe = new DatePipe('en-GB'); // Configuración para 24 horas
    return pipe.transform(this.permiso.horaEntrada, 'HH:mm') ?? '';
  }
  actualizarHora(event: any) {
    const horaIngresada = event.target.value;
    this.permiso.horaEntrada = horaIngresada.length === 5 ? horaIngresada : ''; // Valida formato HH:mm
  }

  loadHolidays() {
    const year = new Date().getFullYear();
    this.permisoService.getHolidays(year).subscribe({
      next: (holidays) => {
        this.holidays = holidays.map((h) => h.date); // Extrae solo las fechas
      },
      error: (err) => console.error('Error obteniendo días festivos:', err),
    });
  }
  loading: boolean = false;
  // Tipos cargados desde la API; fallback a lista hardcodeada si falla
  tiposPermisoConfig: TipoPermiso[] = [];
  tiposPermiso: string[] = [
    'Permiso personal de todo el día',
    'Salida Temprano',
    'Permiso personal por horas',
    'Entrada luego de la jornada',
    'Llegada tarde por factores externos',
    'Cita médica',
    'Cita odontológica',
    'Incapacidad médica',
    'Día de la familia',
    'Calamidad',
    'Suspensión por proceso disciplinario',
    'Licencia de luto',
    'Media jornada por votación',
    'Jurado de votación',
    'Incapacidad laboral',
    'Urgencia médica',
    'Movimiento de horario',
    'Vacaciones',
    'Horas extras (en casa, fuera de las instalaciones y viajes)',
    'Adecuacion horario (Horarios Especiales)',
  ];

  permitidosSalida: string[] = [
    'Salida Temprano', 'Cita médica', 'Cita odontológica', 'Movimiento de horario',
    'Permiso personal por horas', 'Horas extras (en casa, fuera de las instalaciones y viajes)',
    'Adecuacion horario (Horarios Especiales)',
  ];

  permitidoEntrada: string[] = [
    'Entrada luego de la jornada', 'Llegada tarde por factores externos', 'Cita médica',
    'Cita odontológica', 'Movimiento de horario', 'Permiso personal por horas',
    'Horas extras (en casa, fuera de las instalaciones y viajes)', 'Adecuacion horario (Horarios Especiales)',
  ];

  variosDias: string[] = ['Vacaciones', 'Incapacidad médica', 'Incapacidad laboral', 'Movimiento de horario'];

  holidays: string[] = [];

  // Base de horas en formato 12h (etiqueta). Generamos AM/PM y valores 24h al mostrar.
  private baseHoras: string[] = [
    '12:00',
    '12:30',
    '1:00',
    '1:30',
    '2:00',
    '2:30',
    '3:00',
    '3:30',
    '4:00',
    '4:30',
    '5:00',
    '5:30',
    '6:00',
    '6:30',
    '7:00',
    '7:30',
    '8:00',
    '8:30',
    '9:00',
    '9:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
  ];

  // Devuelve una lista de opciones con label (12h + AM/PM) y value (HH:mm 24h)
  get horasOptions(): Array<{ value: string; label: string }> {
    const amOptions: Array<{ value: string; label: string }> = [];
    const pmOptions: Array<{ value: string; label: string }> = [];
    for (const h of this.baseHoras) {
      const [hhStr, mm] = h.split(':');
      let hh = parseInt(hhStr, 10);
      // AM value (00-11)
      const amHour = hh === 12 ? 0 : hh;
      const amValue = `${amHour.toString().padStart(2, '0')}:${mm}`;
      // Only include AM times at or after 07:30 (07:30 == 450 minutes)
      const amMinutes = amHour * 60 + parseInt(mm, 10);
      if (amMinutes >= 7 * 60 + 30) {
        amOptions.push({ value: amValue, label: `${h} AM` });
      }
      // PM value (12-23)
      const pmHour = hh === 12 ? 12 : hh + 12;
      const pmValue = `${pmHour.toString().padStart(2, '0')}:${mm}`;
      pmOptions.push({ value: pmValue, label: `${h} PM` });
    }
    // Order: AM (from 07:30) then PM
    return [...amOptions, ...pmOptions];
  }

  mostrarSalida(): boolean {
    return this.permitidosSalida.includes(this.permiso.tipo);
  }
  mostrarEntrada(): boolean {
    return this.permitidoEntrada.includes(this.permiso.tipo);
  }

  mostrarDias(): boolean {
    return this.variosDias.includes(this.permiso.tipo);
  }

  requiereSoporte(): boolean {
    if (this.tiposPermisoConfig.length > 0) {
      const config = this.tiposPermisoConfig.find(t => t.nombre === this.permiso.tipo);
      return config?.requiere_soporte ?? false;
    }
    return ['Vacaciones', 'Día de la familia', 'Incapacidad médica', 'Incapacidad laboral'].includes(this.permiso.tipo);
  }

  selectedFile: File | null = null;
  today: string;

  constructor(
    private permisoService: PermisosService,
    private tipoPermisoService: TipoPermisoService,
    private toastr: ToastrService,
    private router: Router,
    private location: Location
  ) {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onTipoPermisoChange() {
    if (!this.mostrarSalida()) {
      this.permiso.horaSalida = '';
    }
    if (!this.mostrarEntrada()) {
      this.permiso.horaEntrada = '';
    }
    console.log(
      'horaSalida:',
      this.permiso.horaSalida,
      'horaEntrada:',
      this.permiso.horaEntrada
    );
  }

  isHoliday(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.holidays.includes(dateString);
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  isObservacionesValid(): boolean {
    // Elimina los espacios en blanco al inicio y al final, y verifica la longitud
    // Esto evita que se pueda enviar un permiso con solo espacios
    const observacionesTrimmed = this.permiso.observaciones?.trim() || '';
    return observacionesTrimmed.length >= 50;
  }

  // Función para obtener instrucciones según el tipo de permiso
  getInstrucciones(): string {
    const instrucciones: { [key: string]: string } = {
      'Permiso personal de todo el día':
        'Complete la fecha y las observaciones. Este permiso aplica para todo el día laboral.',
      'Salida Temprano':
        'Indique la hora de salida (antes de las 17:00). Explique el motivo en observaciones.',
      'Permiso personal por horas':
        'Indique hora de salida y hora de regreso. El sistema calculará las horas automáticamente.',
      'Entrada luego de la jornada':
        'Indique la hora de entrada (después de las 7:30). Explique el motivo.',
      'Llegada tarde por factores externos':
        'Indique la hora de entrada real. Explique la razón del retraso en observaciones.',
      'Cita médica':
        'Indique hora de salida y regreso. Adjunte el soporte médico si es posible.',
      'Cita odontológica':
        'Indique hora de salida y regreso. Adjunte el soporte si es posible.',
      'Incapacidad médica':
        'Seleccione fecha de inicio y fin. Debe adjuntar la incapacidad médica obligatoriamente.',
      'Día de la familia':
        'Seleccione la fecha. Este permiso es para un día completo.',
      Calamidad:
        'Explique detalladamente la situación en observaciones. Adjunte soportes si es posible.',
      'Suspensión por proceso disciplinario':
        'Este permiso debe ser gestionado por Recursos Humanos.',
      'Licencia de luto':
        'Seleccione las fechas. Debe adjuntar el certificado de defunción.',
      'Media jornada por votación':
        'Seleccione la fecha de votación. Adjunte el certificado electoral después.',
      'Jurado de votación':
        'Seleccione la fecha. Debe presentar certificado de jurado después.',
      'Incapacidad laboral':
        'Seleccione fecha de inicio y fin. Adjunte el certificado de ARL.',
      'Urgencia médica':
        'Explique la situación. Debe presentar soportes posteriormente.',
      'Movimiento de horario':
        'Indique las horas de entrada y salida del nuevo horario. Requiere aprobación previa.',
      Vacaciones:
        'Seleccione fecha de INICIO y fecha de FIN. El sistema calculará solo días laborales (sin fines de semana ni festivos). Debe solicitar con mínimo 15 días de anticipación.',
      'Horas extras (en casa, fuera de las instalaciones y viajes)':
        'Indique hora de inicio y fin de las horas extras. Debe estar previamente autorizado.',
      'Adecuacion horario (Horarios Especiales)':
        'Indique el nuevo horario. Requiere aprobación de su líder y Recursos Humanos.',
    };

    return (
      instrucciones[this.permiso.tipo] ||
      'Complete todos los campos requeridos y proporcione observaciones detalladas.'
    );
  }

  // Calcular días laborales entre dos fechas
  calcularDiasLaborales(fechaInicio: Date, fechaFin: Date): number {
    let count = 0;
    const current = new Date(fechaInicio);

    while (current <= fechaFin) {
      if (!this.isWeekend(current) && !this.isHoliday(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  createPermiso() {
    // Validar observaciones antes de proceder
    if (!this.isObservacionesValid()) {
      this.toastr.error(
        'Las observaciones deben tener al menos 50 caracteres (sin contar espacios)'
      );
      return;
    }

    // Validar soporte obligatorio para Vacaciones y Día de la familia
    if (this.requiereSoporte() && !this.selectedFile) {
      this.toastr.error(
        'Debe adjuntar un soporte para este tipo de permiso (Vacaciones / Día de la familia)'
      );
      return;
    }

    // Validar días pagos para "Vacaciones más pagos"
    if (this.esVacacionesMasPagos()) {
      if (!this.diasPagos || this.diasPagos < 1) {
        this.toastr.error('Debe indicar la cantidad de días pagos a disfrutar.');
        return;
      }
      if (this.diasPagos > 9) {
        this.toastr.error('Los días pagos a disfrutar no pueden superar 9 días.');
        return;
      }
    }

    this.loading = true;
    const fechaInicio = new Date(this.permiso.fecha + 'T00:00:00');

    // Para vacaciones y permisos de varios días, usar fecha de inicio y fin
    const esPermisoRango = this.variosDias.includes(this.permiso.tipo);

    if (esPermisoRango) {
      // Validar que se haya seleccionado fecha de fin
      if (!this.fechaFin) {
        this.toastr.error('Debe seleccionar una fecha de finalización');
        this.loading = false;
        return;
      }

      const fechaFinDate = new Date(this.fechaFin + 'T00:00:00');

      // Validar que fecha fin sea mayor o igual a fecha inicio
      if (fechaFinDate < fechaInicio) {
        this.toastr.error(
          'La fecha de fin debe ser posterior a la fecha de inicio'
        );
        this.loading = false;
        return;
      }

      // Calcular días laborales
      const diasLaborales = this.calcularDiasLaborales(
        fechaInicio,
        fechaFinDate
      );

      if (diasLaborales === 0) {
        this.toastr.warning('No hay días laborales en el rango seleccionado');
        this.loading = false;
        return;
      }

      // Validar días mínimos de vacaciones según área
      if (this.permiso.tipo === 'Vacaciones') {
        if (this.esGestionAdministrativa() && diasLaborales < 3) {
          this.toastr.error('Para Gestión Administrativa, el mínimo de días laborales de vacaciones es 3');
          this.loading = false;
          return;
        }
        if (!this.esGestionAdministrativa() && diasLaborales < 6) {
          this.toastr.error('El mínimo de días laborales de vacaciones es 6. Solo Gestión Administrativa puede solicitar menos días.');
          this.loading = false;
          return;
        }
      }

      console.log(`📅 Permiso de rango: ${diasLaborales} días laborales`);

      // Crear UN SOLO permiso para el rango completo
      const formData = new FormData();
      for (const key in this.permiso) {
        if (this.permiso.hasOwnProperty(key)) {
          formData.append(key, (this.permiso as any)[key]);
        }
      }
      // Agregar fecha de fin y días laborales
      formData.append('fechaFin', this.fechaFin);
      formData.append('diasLaborales', diasLaborales.toString());

      // Validar y agregar días pagos para Vacaciones más pagos
      if (this.esVacacionesMasPagos()) {
        if (this.diasPagos! > diasLaborales) {
          this.toastr.error(`Los días pagos (${this.diasPagos}) no pueden superar los días de vacaciones solicitados (${diasLaborales}).`);
          this.loading = false;
          return;
        }
        formData.append('diasPagos', String(this.diasPagos));
      }

      if (this.selectedFile) {
        formData.append('soporte', this.selectedFile);
      }

      this.permisoService
        .createPermiso(formData)
        .toPromise()
        .then(() => {
          this.toastr.success(
            `Permiso de ${diasLaborales} días creado con éxito`
          );
          this.router.navigate(['/permisos']);
        })
        .catch((error) => {
          this.toastr.error('Error al crear el permiso');
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
          this.resetPermiso();
        });
    } else {
      // Para permisos de un solo día
      const formData = new FormData();
      for (const key in this.permiso) {
        if (this.permiso.hasOwnProperty(key)) {
          formData.append(key, (this.permiso as any)[key]);
        }
      }
      if (this.selectedFile) {
        formData.append('soporte', this.selectedFile);
      }

      this.permisoService
        .createPermiso(formData)
        .toPromise()
        .then(() => {
          this.toastr.success('Permiso creado con éxito');
          this.router.navigate(['/permisos']);
        })
        .catch((error) => {
          this.toastr.error('Error al crear el permiso');
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
          this.resetPermiso();
        });
    }
  }

  resetPermiso() {
    this.permiso = {
      tipo: '',
      descripcion: '',
      fecha: new Date(),
      horas: 0,
      Uid: parseInt(localStorage.getItem('userId') || '0', 10),
      emailPersonal: localStorage.getItem('email') || '',
      emailLider: localStorage.getItem('correoLider') || '',
      nombre:
        localStorage.getItem('name') + ' ' + localStorage.getItem('lastname'),
      numeroDocumento: localStorage.getItem('documentoIdentificacion') || '',
      horaSalida: '',
      horaEntrada: '',
      observaciones: '',
    };
    this.selectedFile = null;
    this.fechaFin = '';
    this.cantidadDias = 1;
    this.diasPagos = null;
  }

  cancel() {
    this.location.back(); // Redirigir a la página anterior
  }
}
