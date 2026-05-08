import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificadoService } from '../../services/certificado.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-certificado-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './certificado-laboral.component.html',
  styleUrls: ['./certificado-laboral.component.css'],
})
export class CertificadoLaboralComponent implements OnInit {
  uid: number = 0;
  userName: string = '';
  userRole: string = '';
  cargando = false;
  error = '';
  isAdmin = false;

  // Buscador de usuarios
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedUser: any = null;
  searching: boolean = false;

  // Campos para Admin
  tipoCertificado:
    | 'laboral'
    | 'cesantias'
    | 'terminacion'
    | 'desprendible'
    | 'vacaciones'
    | 'notificacion-vacaciones'
    | 'dia-familia' = 'laboral';
  versionConFirma: boolean = false;

  // Variables para el cálculo visual de días
  diasCalendario: number = 0;
  diasNoLaborales: number = 0;

  certificadoConfig: any = {
    empresa: '',
    nombreCompleto: '',
    cedula: '',
    cargo: '',
    salario: 0,
    fechaIngreso: '',
    tipoContrato: 'termino-indefinido',
    fondoPension: 'PORVENIR',
    fondoCesantias: 'PORVENIR',
    areaName: '',
    tipoRetiro: '',
    conceptoRetiro: '',
    valorAutorizado: '',
    causa: '',
    fechaRetiroCesantias: '',
    fechaSalida: '',
    tipoTerminacion: 'terminacion-unilateral-voluntaria',
    fechaPago: '',
    numeroDias: 30,
    extras: 0,
    otrasDeducciones: 0,
    prestamos: 0,
    fechaInicio: '',
    fechaFin: '',
    fechaInicioDate: '',
    fechaFinDate: '',
    diasSolicitados: 0,
    tipoVacaciones: 'solo-vacaciones',
    solicitaCabana: false,
    ciudad: 'Pereira',
    fechaNotificacion: '',
    periodoVacaciones: '',
    fechaDiaFamilia: '',
  };

  constructor(
    private certificadoService: CertificadoService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.setFechaActual();
  }

  obtenerDatosUsuario() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.uid = payload.userId;
        this.userName = `${payload.name} ${payload.lastname}`;
        this.userRole = payload.role || '';
        this.isAdmin = this.userRole === 'Admin';
        // Para usuarios no admin, el área se toma del token/localStorage para validar días de vacaciones.
        this.certificadoConfig.areaName =
          payload.area ||
          payload.areaName ||
          localStorage.getItem('area') ||
          '';

        // Refrescar siempre desde backend para evitar área desactualizada en token/localStorage.
        if (this.uid) {
          this.cargarAreaUsuarioActual();
        }
      } catch (e) {
        this.error = 'Error al obtener datos del usuario';
      }
    }
  }

  private cargarAreaUsuarioActual() {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        const usuarioActual = users.find((u: any) => Number(u.Uid) === Number(this.uid));
        const areaActual =
          usuarioActual?.area?.Aname || usuarioActual?.areaName || usuarioActual?.Aname || '';
        if (areaActual) {
          this.certificadoConfig.areaName = areaActual;
          localStorage.setItem('area', areaActual);
        }
      },
      error: (err) => {
        console.error('No se pudo obtener el área del usuario actual:', err);
      },
    });
  }

  onSearchChange() {
    if (this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
        this.searchResults = users;
        this.searching = false;
      },
      error: (err) => {
        console.error('Error searching users:', err);
        this.searching = false;
      },
    });
  }

  esNotificacionVacaciones(): boolean {
    return this.tipoCertificado === 'notificacion-vacaciones';
  }

  selectUser(user: any) {
    this.selectedUser = user;

    const empresasMap: { [key: string]: string } = {
      AP: 'Andrés Publicidad TG SAS',
      AT: 'Andrés Tobón',
      ME: 'María Evangelina Agudelo Gil',
    };

    this.certificadoConfig.nombreCompleto = `${user.name} ${user.lastName}`;
    this.certificadoConfig.cedula = user.documentoIdentificacion;
    this.certificadoConfig.cargo = user.cargo || user.area?.Aname || '';
    this.certificadoConfig.salario = user.salario || 0;
    this.certificadoConfig.empresa = user.empresa || '';
    this.certificadoConfig.empresaNombre = empresasMap[user.empresa] || '';
    this.certificadoConfig.fondoPension = user.fondoPension || 'PORVENIR';
    this.certificadoConfig.fondoCesantias = user.fondoCesantias || 'PORVENIR';
    this.certificadoConfig.fechaIngreso = user.fechaIngreso || '';
    this.certificadoConfig.areaName =
      user.area?.Aname || user.areaName || user.Aname || '';
    this.certificadoConfig.tipoContrato =
      user.tipoContrato || 'termino-indefinido';

    this.searchQuery = '';
    this.searchResults = [];
  }

  clearSelectedUser() {
    this.selectedUser = null;
    this.certificadoConfig.nombreCompleto = '';
    this.certificadoConfig.cedula = '';
    this.certificadoConfig.cargo = '';
    this.certificadoConfig.salario = 0;
    this.certificadoConfig.empresa = '';
    this.certificadoConfig.empresaNombre = '';
    this.certificadoConfig.fondoPension = 'PORVENIR';
    this.certificadoConfig.fechaIngreso = '';
  }

  setFechaActual() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    this.certificadoConfig.fechaPago = `${dia}/${mes}/${anio}`;
    this.certificadoConfig.fechaNotificacion = `${dia}/${mes}/${anio}`;
    this.certificadoConfig.ciudad = 'Pereira';
  }

  formatNumberWithDots(event: any, field: string) {
    const input = event.target;
    let value = input.value.replace(/\./g, '');
    value = value.replace(/[^\d]/g, '');

    if (value && !isNaN(value)) {
      const formatted = Number(value).toLocaleString('es-CO');
      this.certificadoConfig[field] = formatted;

      const cursorPosition = input.selectionStart;
      const oldLength = input.value.length;
      input.value = formatted;
      const newLength = formatted.length;
      const diff = newLength - oldLength;
      input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    } else if (value === '') {
      this.certificadoConfig[field] = '';
      input.value = '';
    }
  }

  getNumericValue(formattedValue: any): number {
    if (typeof formattedValue === 'string') {
      return Number(formattedValue.replace(/\./g, ''));
    }
    return Number(formattedValue) || 0;
  }

  generarCertificado() {
    this.cargando = true;
    this.error = '';

    if (this.tipoCertificado === 'vacaciones') {
      this.generarVacaciones();
      return;
    }

    if (this.tipoCertificado === 'notificacion-vacaciones') {
      this.generarNotificacionVacaciones();
      return;
    }

    if (this.tipoCertificado === 'dia-familia') {
      this.generarDiaFamilia();
      return;
    }

    if (this.tipoCertificado === 'desprendible') {
      this.generarDesprendible();
      return;
    }

    if (this.isAdmin && this.tipoCertificado !== 'laboral') {
      if (!this.selectedUser) {
        this.error =
          'Por favor, busca y selecciona un empleado antes de generar el certificado.';
        this.cargando = false;
        return;
      }

      this.generarCertificadoPersonalizado();
    } else if (this.tipoCertificado === 'laboral') {
      this.certificadoService.descargarCertificadoImagen(this.uid);
      this.cargando = false;
    } else {
      this.error = 'Por favor, selecciona un tipo de certificado válido.';
      this.cargando = false;
    }
  }

  generarCertificadoPersonalizado() {
    if (this.tipoCertificado === 'desprendible') {
      this.generarDesprendible();
      return;
    }

    if (this.tipoCertificado === 'vacaciones') {
      this.generarVacaciones();
      return;
    }

    if (this.tipoCertificado === 'notificacion-vacaciones') {
      this.generarNotificacionVacaciones();
      return;
    }

    const endpoint =
      this.tipoCertificado === 'cesantias' ? 'cesantias' : 'terminacion';
    const token = localStorage.getItem('token');

    // Usar el UID del usuario seleccionado (no del admin)
    const uidAUsar = this.selectedUser ? this.selectedUser.Uid : this.uid;

    // Ahora solo se hace UNA llamada, el backend genera ambas versiones en un solo PDF
    const params = new URLSearchParams({
      uid: uidAUsar.toString(),
      ...this.certificadoConfig,
    });

    // Construir URL correctamente usando environment
    const url = `${environment.apiUrl}/api/certificados/${uidAUsar}/${endpoint}?${params.toString()}`;
    console.log('URL de descarga:', url);

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        // Verificar que el blob sea válido
        if (blob.size === 0) {
          throw new Error('El archivo descargado está vacío');
        }
        console.log('PDF descargado, tamaño:', blob.size, 'bytes');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado_${this.tipoCertificado}_${this.uid}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.cargando = false;
      })
      .catch((error) => {
        console.error('Error:', error);
        this.error = 'Error al generar el certificado personalizado';
        this.cargando = false;
      });
  }

  generarDesprendible() {
    if (!this.certificadoConfig.fechaPago) {
      this.error = 'La fecha de pago es requerida';
      this.cargando = false;
      return;
    }

    // Para admin se requiere un usuario seleccionado, para no-admin se usa su propio UID
    const uidAUsar = this.isAdmin && this.selectedUser ? this.selectedUser.Uid : this.uid;

    if (this.isAdmin && !this.selectedUser) {
      this.error = 'Por favor, selecciona un empleado';
      this.cargando = false;
      return;
    }

    const token = localStorage.getItem('token');
    const body = {
      Uid: uidAUsar,
      numeroDias: this.certificadoConfig.numeroDias || 30,
      extras: this.getNumericValue(this.certificadoConfig.extras),
      otrasDeducciones: this.getNumericValue(
        this.certificadoConfig.otrasDeducciones
      ),
      prestamos: this.getNumericValue(this.certificadoConfig.prestamos),
      fechaPago: this.certificadoConfig.fechaPago,
    };

    fetch(`${this.certificadoService['apiUrl']}/desprendible`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al generar el desprendible');
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `desprendible_${uidAUsar}_${this.certificadoConfig.fechaPago.replace(/\//g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.cargando = false;
      })
      .catch((error) => {
        console.error('Error:', error);
        this.error = 'Error al generar el desprendible de pago';
        this.cargando = false;
      });
  }

  esGestionAdministrativa(): boolean {
    const areaDetectada =
      this.certificadoConfig.areaName ||
      this.selectedUser?.area?.Aname ||
      this.selectedUser?.areaName ||
      this.selectedUser?.Aname ||
      localStorage.getItem('area') ||
      '';
    const areaName = this.normalizarTexto(areaDetectada);
    return /gestion\s+administrativ/.test(areaName);
  }

  private normalizarTexto(valor: string): string {
    return (valor || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  validarDiasVacaciones(): string | null {
    const dias = this.certificadoConfig.diasSolicitados;
    const esGestionAdmin = this.esGestionAdministrativa();

    if (
      !esGestionAdmin &&
      this.certificadoConfig.tipoVacaciones === 'solo-vacaciones' &&
      dias < 6
    ) {
      return 'Para áreas diferentes a Gestión Administrativa, mínimo 6 días de vacaciones';
    }

    if (
      this.certificadoConfig.tipoVacaciones === 'solo-pagos' &&
      dias > 9
    ) {
      return 'Para días pagos, el máximo es 9 días laborales';
    }

    if (esGestionAdmin && dias < 3) {
      return 'Para Gestión Administrativa, mínimo 3 días de vacaciones';
    }

    if (dias < 1) {
      return 'Debe solicitar al menos 1 día';
    }

    return null;
  }

  private getFestivosColombia(year: number): Date[] {
    const festivos: Date[] = [];

    if (year === 2025) {
      festivos.push(
        new Date(2025, 0, 1),
        new Date(2025, 0, 6),
        new Date(2025, 2, 24),
        new Date(2025, 3, 17),
        new Date(2025, 3, 18),
        new Date(2025, 4, 1),
        new Date(2025, 4, 19),
        new Date(2025, 5, 9),
        new Date(2025, 5, 16),
        new Date(2025, 5, 23),
        new Date(2025, 6, 20),
        new Date(2025, 7, 7),
        new Date(2025, 7, 18),
        new Date(2025, 9, 13),
        new Date(2025, 10, 3),
        new Date(2025, 10, 17),
        new Date(2025, 11, 8),
        new Date(2025, 11, 25)
      );
    } else if (year === 2026) {
      festivos.push(
        new Date(2026, 0, 1),
        new Date(2026, 0, 12),
        new Date(2026, 2, 23),
        new Date(2026, 3, 2),
        new Date(2026, 3, 3),
        new Date(2026, 4, 1),
        new Date(2026, 4, 18),
        new Date(2026, 5, 8),
        new Date(2026, 5, 15),
        new Date(2026, 5, 29),
        new Date(2026, 6, 20),
        new Date(2026, 7, 7),
        new Date(2026, 7, 17),
        new Date(2026, 9, 12),
        new Date(2026, 10, 2),
        new Date(2026, 10, 16),
        new Date(2026, 11, 8),
        new Date(2026, 11, 25)
      );
    }

    return festivos;
  }

  private esFestivo(fecha: Date, festivos: Date[]): boolean {
    return festivos.some(
      (festivo) =>
        festivo.getDate() === fecha.getDate() &&
        festivo.getMonth() === fecha.getMonth() &&
        festivo.getFullYear() === fecha.getFullYear()
    );
  }

  private calcularDiasLaborales(fechaInicio: Date, fechaFin: Date): number {
    let diasLaborales = 0;

    const currentDate = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth(),
      fechaInicio.getDate()
    );
    const endDate = new Date(
      fechaFin.getFullYear(),
      fechaFin.getMonth(),
      fechaFin.getDate()
    );

    const years = new Set<number>();
    years.add(currentDate.getFullYear());
    years.add(endDate.getFullYear());

    let festivos: Date[] = [];
    years.forEach((year) => {
      festivos = festivos.concat(this.getFestivosColombia(year));
    });

    while (currentDate <= endDate) {
      const diaSemana = currentDate.getDay();
      const esFestivoHoy = this.esFestivo(currentDate, festivos);

      if (diaSemana >= 1 && diaSemana <= 5 && !esFestivoHoy) {
        diasLaborales++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return diasLaborales;
  }

  private getNombreDia(diaSemana: number): string {
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return dias[diaSemana];
  }

  private convertirFechaAFormato(fechaISO: string): string {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  }

  onDateChange() {
    if (
      this.certificadoConfig.fechaInicioDate &&
      this.certificadoConfig.fechaFinDate
    ) {
      this.certificadoConfig.fechaInicio = this.convertirFechaAFormato(
        this.certificadoConfig.fechaInicioDate
      );
      this.certificadoConfig.fechaFin = this.convertirFechaAFormato(
        this.certificadoConfig.fechaFinDate
      );

      const [diaInicio, mesInicio, anioInicio] =
        this.certificadoConfig.fechaInicio.split('/');
      const [diaFin, mesFin, anioFin] =
        this.certificadoConfig.fechaFin.split('/');

      const inicio = new Date(
        parseInt(anioInicio),
        parseInt(mesInicio) - 1,
        parseInt(diaInicio)
      );
      const fin = new Date(
        parseInt(anioFin),
        parseInt(mesFin) - 1,
        parseInt(diaFin)
      );

      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      this.diasCalendario = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const diasLaborales = this.calcularDiasLaborales(inicio, fin);
      this.certificadoConfig.diasSolicitados = diasLaborales;
      this.diasNoLaborales = this.diasCalendario - diasLaborales;

      this.error = '';
    }
  }

  calcularDiasVacaciones() {
    const fechaInicio = this.certificadoConfig.fechaInicio;
    const fechaFin = this.certificadoConfig.fechaFin;

    if (!fechaInicio || !fechaFin) {
      return;
    }

    const parseFecha = (fechaStr: string): Date | null => {
      const partes = fechaStr.split('/');
      if (partes.length !== 3) return null;

      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const anio = parseInt(partes[2], 10);

      if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;

      return new Date(anio, mes, dia);
    };

    const inicio = parseFecha(fechaInicio);
    const fin = parseFecha(fechaFin);

    if (!inicio || !fin) {
      this.error = 'Formato de fecha inválido. Use DD/MM/YYYY';
      return;
    }

    if (fin < inicio) {
      this.error = 'La fecha de fin debe ser posterior a la fecha de inicio';
      this.certificadoConfig.diasSolicitados = 0;
      return;
    }

    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    this.diasCalendario = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const diasLaborales = this.calcularDiasLaborales(inicio, fin);
    this.certificadoConfig.diasSolicitados = diasLaborales;

    this.diasNoLaborales = this.diasCalendario - diasLaborales;

    this.error = '';
  }

  generarVacaciones() {
    if (
      !this.certificadoConfig.fechaInicio ||
      !this.certificadoConfig.fechaFin
    ) {
      this.error = 'Las fechas de inicio y fin son requeridas';
      this.cargando = false;
      return;
    }

    const errorDias = this.validarDiasVacaciones();
    if (errorDias) {
      this.error = errorDias;
      this.cargando = false;
      return;
    }

    const uidAUsar =
      this.isAdmin && this.selectedUser ? this.selectedUser.Uid : this.uid;

    if (this.isAdmin && !this.selectedUser) {
      this.error = 'Por favor, selecciona un empleado';
      this.cargando = false;
      return;
    }

    const token = localStorage.getItem('token');
    const body = {
      Uid: uidAUsar,
      fechaInicio: this.certificadoConfig.fechaInicio,
      fechaFin: this.certificadoConfig.fechaFin,
      diasSolicitados: this.certificadoConfig.diasSolicitados,
      tipoVacaciones: this.certificadoConfig.tipoVacaciones,
      solicitaCabana: this.certificadoConfig.solicitaCabana,
    };

    fetch(`${this.certificadoService['apiUrl']}/vacaciones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(
              err.error || 'Error al generar el certificado de vacaciones'
            );
          });
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const uidParaNombre =
          this.isAdmin && this.selectedUser ? this.selectedUser.Uid : this.uid;
        // ✅ CAMBIO: .png → .pdf
        a.download = `vacaciones_${uidParaNombre}_${this.certificadoConfig.fechaInicio.replace(
          /\//g,
          '-'
        )}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.cargando = false;
        this.error = '';
      })
      .catch((error) => {
        console.error('Error:', error);
        this.error =
          error.message || 'Error al generar el certificado de vacaciones';
        this.cargando = false;
      });
  }

  generarNotificacionVacaciones() {
    if (
      !this.certificadoConfig.fechaInicio ||
      !this.certificadoConfig.fechaFin
    ) {
      this.error = 'Las fechas de inicio y fin son requeridas';
      this.cargando = false;
      return;
    }

    if (!this.certificadoConfig.periodoVacaciones) {
      this.error = 'El período de vacaciones es requerido (ej: 2024-2025)';
      this.cargando = false;
      return;
    }

    if (!this.isAdmin || !this.selectedUser) {
      this.error = 'Debe ser administrador y seleccionar un empleado';
      this.cargando = false;
      return;
    }

    const token = localStorage.getItem('token');
    const body = {
      Uid: this.selectedUser.Uid,
      fechaInicio: this.certificadoConfig.fechaInicio,
      fechaFin: this.certificadoConfig.fechaFin,
      diasSolicitados: this.certificadoConfig.diasSolicitados,
      ciudad: this.certificadoConfig.ciudad || 'Pereira',
      fechaNotificacion: this.certificadoConfig.fechaNotificacion,
      periodoVacaciones: this.certificadoConfig.periodoVacaciones,
      solicitaCabana: this.certificadoConfig.solicitaCabana,
    };

    fetch(`${this.certificadoService['apiUrl']}/notificacion-vacaciones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(
              err.error || 'Error al generar la notificación de vacaciones'
            );
          });
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // ✅ CAMBIO: .png → .pdf
        a.download = `notificacion_vacaciones_${
          this.selectedUser.Uid
        }_${this.certificadoConfig.fechaInicio.replace(/\//g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.cargando = false;
        this.error = '';
      })
      .catch((error) => {
        console.error('Error:', error);
        this.error =
          error.message || 'Error al generar la notificación de vacaciones';
        this.cargando = false;
      });
  }

  generarDiaFamilia() {
    if (!this.certificadoConfig.fechaDiaFamilia) {
      this.error = 'La fecha del Día de la Familia es requerida';
      this.cargando = false;
      return;
    }

    const uidAUsar =
      this.isAdmin && this.selectedUser ? this.selectedUser.Uid : this.uid;

    if (this.isAdmin && !this.selectedUser) {
      this.error = 'Por favor, selecciona un empleado';
      this.cargando = false;
      return;
    }

    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaSolicitud = `${dia}/${mes}/${anio}`;

    const token = localStorage.getItem('token');
    const body = {
      Uid: uidAUsar,
      fechaSolicitud: fechaSolicitud,
      fechaDiaFamilia: this.certificadoConfig.fechaDiaFamilia,
    };

    fetch(`${this.certificadoService['apiUrl']}/dia-familia`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(
              err.error ||
                'Error al generar el certificado del Día de la Familia'
            );
          });
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const uidParaNombre =
          this.isAdmin && this.selectedUser ? this.selectedUser.Uid : this.uid;
        // ✅ CAMBIO: .png → .pdf
        a.download = `dia_familia_${uidParaNombre}_${this.certificadoConfig.fechaDiaFamilia.replace(
          /\//g,
          '-'
        )}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.cargando = false;
        this.error = '';
      })
      .catch((error) => {
        console.error('Error:', error);
        this.error =
          error.message ||
          'Error al generar el certificado del Día de la Familia';
        this.cargando = false;
      });
  }
}
