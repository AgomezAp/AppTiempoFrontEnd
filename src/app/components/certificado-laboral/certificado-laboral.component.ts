import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificadoService } from '../../services/certificado.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

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
  versionConFirma: boolean = false; // Si se genera versión con campo de firma

  // Variables para el cálculo visual de días
  diasCalendario: number = 0;
  diasNoLaborales: number = 0;

  certificadoConfig: any = {
    // Empresa
    empresa: '', // AP, AT, ME

    // Campos comunes
    nombreCompleto: '',
    cedula: '',
    cargo: '',
    salario: 0,
    fechaIngreso: '',
    tipoContrato: 'termino-indefinido', // termino-indefinido, termino-fijo
    fondoPension: 'PORVENIR',
    fondoCesantias: 'PORVENIR',
    areaName: '', // Nombre del área para validaciones

    // Campos para Cesantías
    tipoRetiro: '',
    conceptoRetiro: '',
    valorAutorizado: '',
    causa: '',
    fechaRetiroCesantias: '', // Fecha de retiro para terminación de contrato

    // Campos para Terminación
    fechaSalida: '',
    tipoTerminacion: 'terminacion-unilateral-voluntaria', // terminacion-injusta-causa, terminacion-justa-causa

    // Campos para Desprendible de Pago
    fechaPago: '',
    numeroDias: 30,
    extras: 0,
    otrasDeducciones: 0,
    prestamos: 0,

    // Campos para Vacaciones
    fechaInicio: '',
    fechaFin: '',
    fechaInicioDate: '', // Para input type="date"
    fechaFinDate: '', // Para input type="date"
    diasSolicitados: 0,
    tipoVacaciones: 'solo-vacaciones', // 'solo-vacaciones' o 'vacaciones-pagos'
    solicitaCabana: false, // Nuevo campo para solicitar cabaña

    // Campos para Notificación de Vacaciones
    ciudad: 'Pereira',
    fechaNotificacion: '',
    periodoVacaciones: '', // Período de las vacaciones (ej: "2024-2025")

    // Campos para Día de la Familia
    fechaDiaFamilia: '',
  };

  constructor(
    private certificadoService: CertificadoService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.setFechaActual(); // Auto-llenar fecha de pago con fecha actual
  }

  obtenerDatosUsuario() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.uid = payload.userId;
        this.userName = `${payload.name} ${payload.lastname}`;
        this.userRole = payload.role || '';

        // Verificar si es Admin
        this.isAdmin = this.userRole === 'Admin';
      } catch (e) {
        this.error = 'Error al obtener datos del usuario';
      }
    }
  }

  // Buscar usuarios
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

  // Helper para verificar tipo de certificado
  esNotificacionVacaciones(): boolean {
    console.log(
      'Verificando notificacion vacaciones:',
      this.tipoCertificado,
      this.tipoCertificado === 'notificacion-vacaciones'
    );
    return this.tipoCertificado === 'notificacion-vacaciones';
  }

  // Seleccionar usuario del buscador
  selectUser(user: any) {
    this.selectedUser = user;

    // Mapear código de empresa a nombre completo
    const empresasMap: { [key: string]: string } = {
      AP: 'Andrés Publicidad TG SAS',
      AT: 'Andrés Tobón',
      ME: 'María Evangelina Agudelo Gil',
    };

    // Auto-llenar campos del certificado
    this.certificadoConfig.nombreCompleto = `${user.name} ${user.lastName}`;
    this.certificadoConfig.cedula = user.documentoIdentificacion;
    this.certificadoConfig.cargo = user.cargo || user.area?.Aname || '';
    this.certificadoConfig.salario = user.salario || 0;
    this.certificadoConfig.empresa = user.empresa || '';
    this.certificadoConfig.empresaNombre = empresasMap[user.empresa] || '';
    this.certificadoConfig.fondoPension = user.fondoPension || 'PORVENIR';
    this.certificadoConfig.fondoCesantias = user.fondoCesantias || 'PORVENIR';
    this.certificadoConfig.fechaIngreso = user.fechaIngreso || '';
    this.certificadoConfig.areaName = user.area?.Aname || '';
    this.certificadoConfig.tipoContrato =
      user.tipoContrato || 'termino-indefinido';

    // Limpiar búsqueda
    this.searchQuery = '';
    this.searchResults = [];
  }

  // Limpiar usuario seleccionado
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

  // Auto-llenar fecha actual en formato DD/MM/YYYY
  setFechaActual() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    this.certificadoConfig.fechaPago = `${dia}/${mes}/${anio}`;
    // También establecer fecha de notificación automáticamente
    this.certificadoConfig.fechaNotificacion = `${dia}/${mes}/${anio}`;
    // Ciudad siempre será Pereira
    this.certificadoConfig.ciudad = 'Pereira';
  }

  // Formatear número con puntos de miles en tiempo real
  formatNumberWithDots(event: any, field: string) {
    const input = event.target;
    let value = input.value.replace(/\./g, ''); // Remover puntos existentes

    // Mantener solo números
    value = value.replace(/[^\d]/g, '');

    if (value && !isNaN(value)) {
      const formatted = Number(value).toLocaleString('es-CO');
      this.certificadoConfig[field] = formatted;

      // Mantener la posición del cursor
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

  // Obtener valor numérico sin formato para enviar al backend
  getNumericValue(formattedValue: any): number {
    if (typeof formattedValue === 'string') {
      return Number(formattedValue.replace(/\./g, ''));
    }
    return Number(formattedValue) || 0;
  }

  generarCertificado() {
    this.cargando = true;
    this.error = '';

    // Vacaciones: disponible para todos los usuarios
    if (this.tipoCertificado === 'vacaciones') {
      this.generarVacaciones();
      return;
    }

    // Notificación de Vacaciones: solo para admins
    if (this.tipoCertificado === 'notificacion-vacaciones') {
      this.generarNotificacionVacaciones();
      return;
    }

    // Día de la Familia: disponible para todos los usuarios
    if (this.tipoCertificado === 'dia-familia') {
      this.generarDiaFamilia();
      return;
    }

    // Si es admin y NO es certificado laboral estándar
    if (this.isAdmin && this.tipoCertificado !== 'laboral') {
      // Validar que se haya seleccionado un usuario
      if (!this.selectedUser) {
        this.error =
          'Por favor, busca y selecciona un empleado antes de generar el certificado.';
        this.cargando = false;
        return;
      }

      this.generarCertificadoPersonalizado();
    } else if (this.tipoCertificado === 'laboral') {
      // Certificado laboral estándar
      this.certificadoService.descargarCertificadoImagen(this.uid);
      this.cargando = false;
    } else {
      this.error = 'Por favor, selecciona un tipo de certificado válido.';
      this.cargando = false;
    }
  }

  generarCertificadoPersonalizado() {
    // Si es desprendible de pago, usar lógica diferente (POST en lugar de GET)
    if (this.tipoCertificado === 'desprendible') {
      this.generarDesprendible();
      return;
    }

    // Si es vacaciones, usar lógica de POST
    if (this.tipoCertificado === 'vacaciones') {
      this.generarVacaciones();
      return;
    }

    // Si es notificación de vacaciones, usar lógica de POST
    if (this.tipoCertificado === 'notificacion-vacaciones') {
      this.generarNotificacionVacaciones();
      return;
    }

    const endpoint =
      this.tipoCertificado === 'cesantias' ? 'cesantias' : 'terminacion';
    const token = localStorage.getItem('token');

    // Generar AMBAS versiones: sin firma y con firma
    const versiones = [
      { conFirma: 'false', sufijo: 'digital' },
      { conFirma: 'true', sufijo: 'manual' },
    ];

    versiones.forEach((version, index) => {
      // Construir URL con parámetros
      const params = new URLSearchParams({
        uid: this.uid.toString(),
        conFirma: version.conFirma,
        ...this.certificadoConfig,
      });

      const url = `${this.certificadoService['apiUrl']}/${
        this.uid
      }/${endpoint}?${params.toString()}`;

      setTimeout(() => {
        fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificado_${this.tipoCertificado}_${version.sufijo}_${this.uid}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Terminar loading después de la última descarga
            if (index === versiones.length - 1) {
              this.cargando = false;
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            this.error = 'Error al generar el certificado personalizado';
            this.cargando = false;
          });
      }, index * 500); // Pequeño delay entre descargas
    });
  }

  generarDesprendible() {
    // Validar campos requeridos
    if (!this.certificadoConfig.fechaPago) {
      this.error = 'La fecha de pago es requerida';
      this.cargando = false;
      return;
    }

    const token = localStorage.getItem('token');
    const body = {
      Uid: this.selectedUser.Uid,
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
        a.download = `desprendible_${
          this.selectedUser.Uid
        }_${this.certificadoConfig.fechaPago.replace(/\//g, '-')}.png`;
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

  // Verificar si el área es Gestión Administrativa
  esGestionAdministrativa(): boolean {
    const areaName = this.certificadoConfig.areaName?.toLowerCase() || '';
    return (
      areaName.includes('gestión administrativa') ||
      areaName.includes('gestion administrativa')
    );
  }

  // Validar días de vacaciones según área
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

    // Para Gestión Administrativa, mínimo 3 días
    if (esGestionAdmin && dias < 3) {
      return 'Para Gestión Administrativa, mínimo 3 días de vacaciones';
    }

    if (dias < 1) {
      return 'Debe solicitar al menos 1 día';
    }

    return null;
  }

  // Festivos de Colombia 2025-2026
  private getFestivosColombia(year: number): Date[] {
    const festivos: Date[] = [];

    if (year === 2025) {
      festivos.push(
        new Date(2025, 0, 1), // 1 Enero - Año Nuevo
        new Date(2025, 0, 6), // 6 Enero - Reyes Magos
        new Date(2025, 2, 24), // 24 Marzo - San José
        new Date(2025, 3, 17), // 17 Abril - Jueves Santo
        new Date(2025, 3, 18), // 18 Abril - Viernes Santo
        new Date(2025, 4, 1), // 1 Mayo - Día del Trabajo
        new Date(2025, 4, 19), // 19 Mayo - Ascensión
        new Date(2025, 5, 9), // 9 Junio - Corpus Christi
        new Date(2025, 5, 16), // 16 Junio - Sagrado Corazón
        new Date(2025, 5, 23), // 23 Junio - San Pedro y San Pablo
        new Date(2025, 6, 20), // 20 Julio - Independencia
        new Date(2025, 7, 7), // 7 Agosto - Batalla de Boyacá
        new Date(2025, 7, 18), // 18 Agosto - Asunción
        new Date(2025, 9, 13), // 13 Octubre - Día de la Raza
        new Date(2025, 10, 3), // 3 Noviembre - Todos los Santos
        new Date(2025, 10, 17), // 17 Noviembre - Independencia de Cartagena
        new Date(2025, 11, 8), // 8 Diciembre - Inmaculada Concepción
        new Date(2025, 11, 25) // 25 Diciembre - Navidad
      );
    } else if (year === 2026) {
      festivos.push(
        new Date(2026, 0, 1), // 1 Enero
        new Date(2026, 0, 12), // 12 Enero - Reyes
        new Date(2026, 2, 23), // 23 Marzo - San José
        new Date(2026, 3, 2), // 2 Abril - Jueves Santo
        new Date(2026, 3, 3), // 3 Abril - Viernes Santo
        new Date(2026, 4, 1), // 1 Mayo
        new Date(2026, 4, 18), // 18 Mayo - Ascensión
        new Date(2026, 5, 8), // 8 Junio - Corpus
        new Date(2026, 5, 15), // 15 Junio - Sagrado Corazón
        new Date(2026, 5, 29), // 29 Junio - San Pedro
        new Date(2026, 6, 20), // 20 Julio
        new Date(2026, 7, 7), // 7 Agosto
        new Date(2026, 7, 17), // 17 Agosto - Asunción
        new Date(2026, 9, 12), // 12 Octubre
        new Date(2026, 10, 2), // 2 Noviembre
        new Date(2026, 10, 16), // 16 Noviembre
        new Date(2026, 11, 8), // 8 Diciembre
        new Date(2026, 11, 25) // 25 Diciembre
      );
    }

    return festivos;
  }

  // Verificar si una fecha es festivo
  private esFestivo(fecha: Date, festivos: Date[]): boolean {
    return festivos.some(
      (festivo) =>
        festivo.getDate() === fecha.getDate() &&
        festivo.getMonth() === fecha.getMonth() &&
        festivo.getFullYear() === fecha.getFullYear()
    );
  }

  // Calcular días laborales (excluyendo fines de semana y festivos)
  private calcularDiasLaborales(fechaInicio: Date, fechaFin: Date): number {
    let diasLaborales = 0;

    // Crear copias limpias de las fechas (solo año, mes, día - sin hora)
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

    // Obtener festivos de los años involucrados
    const years = new Set<number>();
    years.add(currentDate.getFullYear());
    years.add(endDate.getFullYear());

    let festivos: Date[] = [];
    years.forEach((year) => {
      festivos = festivos.concat(this.getFestivosColombia(year));
    });

    console.log('🔍 Debug calcularDiasLaborales:', {
      fechaInicio: currentDate.toLocaleDateString('es-CO'),
      fechaFin: endDate.toLocaleDateString('es-CO'),
      añosInvolucrados: Array.from(years),
    });

    // Iterar día por día
    while (currentDate <= endDate) {
      const diaSemana = currentDate.getDay();
      const esFestivoHoy = this.esFestivo(currentDate, festivos);

      // Solo Lunes (1) a Viernes (5) son laborales, y solo si NO es festivo
      if (diaSemana >= 1 && diaSemana <= 5 && !esFestivoHoy) {
        diasLaborales++;
        console.log(
          `📅 ${currentDate.toLocaleDateString('es-CO')} - ${this.getNombreDia(
            diaSemana
          )}: ✅ LABORAL`
        );
      } else {
        const motivo =
          diaSemana === 0 ? 'Domingo' : diaSemana === 6 ? 'Sábado' : 'Festivo';
        console.log(
          `📅 ${currentDate.toLocaleDateString('es-CO')} - ${this.getNombreDia(
            diaSemana
          )}: ❌ NO LABORAL (${motivo})`
        );
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('📊 Total días laborales:', diasLaborales);

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
  // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
  private convertirFechaAFormato(fechaISO: string): string {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  }

  // Manejar cambio de fechas
  onDateChange() {
    if (
      this.certificadoConfig.fechaInicioDate &&
      this.certificadoConfig.fechaFinDate
    ) {
      // Convertir a formato DD/MM/YYYY
      this.certificadoConfig.fechaInicio = this.convertirFechaAFormato(
        this.certificadoConfig.fechaInicioDate
      );
      this.certificadoConfig.fechaFin = this.convertirFechaAFormato(
        this.certificadoConfig.fechaFinDate
      );

      // Crear objetos Date
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

      console.log('📅 Cálculo de días:', {
        fechaInicio: inicio.toLocaleDateString('es-CO'),
        fechaFin: fin.toLocaleDateString('es-CO'),
      });

      // Calcular días de calendario
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      this.diasCalendario = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Calcular días laborales
      const diasLaborales = this.calcularDiasLaborales(inicio, fin);

      console.log('📊 Resultado del cálculo:', {
        diasCalendario: this.diasCalendario,
        diasLaborales: diasLaborales,
        diasNoLaborales: this.diasCalendario - diasLaborales,
      });

      this.certificadoConfig.diasSolicitados = diasLaborales;

      // Calcular días no laborales
      this.diasNoLaborales = this.diasCalendario - diasLaborales;

      this.error = '';
    }
  }

  // Calcular días de vacaciones automáticamente
  calcularDiasVacaciones() {
    const fechaInicio = this.certificadoConfig.fechaInicio;
    const fechaFin = this.certificadoConfig.fechaFin;

    // Validar que ambas fechas estén completas
    if (!fechaInicio || !fechaFin) {
      return;
    }

    // Parsear fechas en formato DD/MM/YYYY
    const parseFecha = (fechaStr: string): Date | null => {
      const partes = fechaStr.split('/');
      if (partes.length !== 3) return null;

      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0-11
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

    // Calcular días de calendario
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    this.diasCalendario = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calcular días laborales (excluyendo fines de semana y festivos)
    const diasLaborales = this.calcularDiasLaborales(inicio, fin);
    this.certificadoConfig.diasSolicitados = diasLaborales;

    // Calcular días no laborales
    this.diasNoLaborales = this.diasCalendario - diasLaborales;

    this.error = ''; // Limpiar error si el cálculo es exitoso
  }

  generarVacaciones() {
    // Validar campos requeridos
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

    // Determinar Uid: si es admin usa selectedUser, si no usa su propio uid
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
        a.download = `vacaciones_${uidParaNombre}_${this.certificadoConfig.fechaInicio.replace(
          /\//g,
          '-'
        )}.png`;
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
    // Validar campos requeridos
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

    // Solo admin puede generar este certificado
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
      solicitaCabana: this.certificadoConfig.solicitaCabana, // Nuevo campo para cabaña
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
        a.download = `notificacion_vacaciones_${
          this.selectedUser.Uid
        }_${this.certificadoConfig.fechaInicio.replace(/\//g, '-')}.png`;
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
    // Validar campo requerido
    if (!this.certificadoConfig.fechaDiaFamilia) {
      this.error = 'La fecha del Día de la Familia es requerida';
      this.cargando = false;
      return;
    }

    // Determinar Uid: si es admin usa selectedUser, si no usa su propio uid
    const uidAUsar =
      this.isAdmin && this.selectedUser ? this.selectedUser.Uid : this.uid;

    if (this.isAdmin && !this.selectedUser) {
      this.error = 'Por favor, selecciona un empleado';
      this.cargando = false;
      return;
    }

    // Obtener fecha actual en formato DD/MM/YYYY
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
        a.download = `dia_familia_${uidParaNombre}_${this.certificadoConfig.fechaDiaFamilia.replace(
          /\//g,
          '-'
        )}.png`;
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
