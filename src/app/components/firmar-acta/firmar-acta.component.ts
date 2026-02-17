import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActaRecargaService } from '../../services/acta-recarga.service';
import { ActaRecarga } from '../../interfaces/acta-recarga';

@Component({
  selector: 'app-firmar-acta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmar-acta.component.html',
  styleUrl: './firmar-acta.component.css',
})
export class FirmarActaComponent implements OnInit {
  token: string = '';
  loading = true;
  error: string | null = null;
  success = false;
  firmando = false;

  acta: ActaRecarga | null = null;

  // Datos de firma
  firmaRevisor: string = '';
  tipoFirmaRevisor: 'texto' | 'imagen' = 'texto';
  firmaRevisorImagenPreview: string | null = null;
  firmaRevisorImagenBase64: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actaService: ActaRecargaService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error = 'Token inválido';
      this.loading = false;
      return;
    }
    this.cargarActa();
  }

  cargarActa(): void {
    this.actaService.getActaByToken(this.token).subscribe({
      next: (res) => {
        this.acta = res.acta;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.msg || 'Token inválido o expirado';
        this.loading = false;
      },
    });
  }

  onFirmaRevisorImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.firmaRevisorImagenBase64 = reader.result as string;
      this.firmaRevisorImagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  firmarActa(): void {
    const firmaTexto =
      this.tipoFirmaRevisor === 'texto' ? this.firmaRevisor.trim() : undefined;
    const firmaImagen =
      this.tipoFirmaRevisor === 'imagen'
        ? this.firmaRevisorImagenBase64
        : undefined;

    if (!firmaTexto && !firmaImagen) {
      alert('Debe proporcionar su firma (nombre o imagen)');
      return;
    }

    this.firmando = true;
    this.actaService
      .firmarActa(this.token, {
        firmaRevisor: firmaTexto,
        firmaRevisorImagen: firmaImagen || undefined,
      })
      .subscribe({
        next: (res) => {
          this.firmando = false;
          this.success = true;
          this.acta = res.acta;
        },
        error: (err) => {
          this.firmando = false;
          alert(err.error?.msg || 'Error al firmar el acta');
        },
      });
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
    });
  }

  formatearMonto(monto: number | null): string {
    if (monto === null) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);
  }

  generarPDF(): void {
    if (!this.acta) return;

    const contenidoHTML = this.generarHTMLActa(this.acta);
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      ventana.onload = () => {
        ventana.print();
      };
    }
  }

  generarHTMLActa(acta: ActaRecarga): string {
    const formatMoney = (amount: number | null) => {
      if (amount === null || amount === undefined) return '________________';
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatMonth = (date: string) => {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString('es-CO', { month: 'long' });
    };

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acta de Validación y Cierre de Recargas</title>
        <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          /* ========================================
             VARIABLES DE MARCA
             ======================================== */
          :root {
            --color-primary: #141414;
            --color-secondary: #FFD600;
            --color-text: #141414;
            --color-text-light: #ffffff;
            --color-bg: #ffffff;
            --font-family: 'Fira Sans', sans-serif;
          }

          /* ========================================
             BASE
             ======================================== */
          @page {
            size: letter;
            margin: 2cm;
          }

          body {
            font-family: var(--font-family);
            font-size: 12pt;
            line-height: 1.6;
            color: var(--color-text);
            margin: 0;
            padding: 40px;
            background-color: var(--color-bg);
          }

          /* ========================================
             HEADER DEL ACTA
             ======================================== */
          .header {
            text-align: center;
            margin-bottom: 35px;
            padding-bottom: 25px;
            border-bottom: 3px solid var(--color-secondary);
          }

          .logo-ap {
            font-size: 32pt;
            font-weight: 700;
            color: var(--color-primary);
            margin: 0;
            font-family: var(--font-family);
            letter-spacing: -1px;
          }

          .logo-text {
            font-size: 10pt;
            letter-spacing: 4px;
            color: var(--color-primary);
            margin: 0 0 20px 0;
            font-weight: 700;
            text-transform: uppercase;
            font-family: var(--font-family);
          }

          h1 {
            font-size: 15pt;
            font-weight: 700;
            text-decoration: none;
            margin: 20px 0 15px 0;
            color: var(--color-primary);
            font-family: var(--font-family);
            position: relative;
            display: inline-block;
            padding-bottom: 8px;
          }

          h1::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 3px;
            background-color: var(--color-secondary);
            border-radius: 2px;
          }

          /* ========================================
             PERIODO
             ======================================== */
          .periodo {
            font-size: 11pt;
            margin-top: 20px;
            margin-bottom: 0;
            color: #444;
            font-weight: 400;
          }

          .linea-campo {
            display: inline-block;
            border-bottom: 2px solid var(--color-primary);
            min-width: 90px;
            text-align: center;
            padding: 0 8px 2px;
            font-weight: 600;
            color: var(--color-primary);
          }

          /* ========================================
             DESCRIPCIÓN Y TEXTOS
             ======================================== */
          .descripcion {
            text-align: justify;
            margin-bottom: 24px;
            font-size: 11pt;
            color: #444;
            line-height: 1.7;
          }

          .comparacion-texto {
            text-align: justify;
            margin: 28px 0;
            font-style: italic;
            color: #555;
            font-size: 11pt;
            padding: 14px 18px;
            background: rgba(255, 214, 0, 0.06);
            border-left: 4px solid var(--color-secondary);
            border-radius: 0 8px 8px 0;
            line-height: 1.7;
          }

          .nota {
            text-align: justify;
            margin: 28px 0;
            font-size: 11pt;
            color: #444;
            line-height: 1.7;
          }

          /* ========================================
             CAMPOS DE MONTOS
             ======================================== */
          .campo-monto {
            margin: 12px 0;
            font-size: 11pt;
            padding: 14px 20px;
            background: #fafafa;
            border-radius: 8px;
            border-left: 4px solid var(--color-secondary);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .campo-monto strong {
            color: var(--color-primary);
            font-weight: 600;
            font-family: var(--font-family);
          }

          .campo-monto .valor {
            display: inline-block;
            border-bottom: 2px solid var(--color-primary);
            min-width: 180px;
            text-align: center;
            padding: 0 12px 3px;
            font-weight: 700;
            color: var(--color-primary);
            font-size: 12pt;
          }

          /* ========================================
             SECCIÓN DE FIRMAS
             ======================================== */
          .firmas {
            margin-top: 55px;
            padding-top: 20px;
          }

          .firma-row {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            gap: 40px;
          }

          .firma-col {
            width: 45%;
          }

          .firma-col p:first-child {
            font-size: 10pt;
            color: #666;
            font-weight: 500;
            margin-bottom: 5px;
          }

          .firma-linea {
            border-top: 2px solid var(--color-primary);
            margin-top: 65px;
            padding-top: 8px;
            position: relative;
          }

          .firma-linea::before {
            content: '';
            position: absolute;
            top: -2px;
            left: 0;
            width: 40px;
            height: 2px;
            background-color: var(--color-secondary);
          }

          .firma-col[style*="text-align: right"] .firma-linea::before {
            left: auto;
            right: 0;
          }

          .firma-nombre {
            font-weight: 700;
            margin: 6px 0 0 0;
            color: var(--color-primary);
            font-size: 11pt;
            font-family: var(--font-family);
          }

          .firma-cargo {
            font-size: 9.5pt;
            color: #777;
            margin: 3px 0 0 0;
            font-weight: 400;
          }

          .firma-imagen {
            max-width: 200px;
            max-height: 80px;
            display: block;
            margin-bottom: 8px;
          }

          .firma-imagen-right {
            margin-left: auto;
          }

          /* ========================================
             FOOTER DEL ACTA
             ======================================== */
          .footer-acta {
            margin-top: 55px;
            text-align: center;
            font-size: 8.5pt;
            color: #999;
            border-top: 2px solid #eee;
            padding-top: 16px;
            position: relative;
          }

          .footer-acta::before {
            content: '';
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 2px;
            background-color: var(--color-secondary);
          }

          /* ========================================
             DECORADORES
             ======================================== */
          .accent-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            background-color: var(--color-secondary);
            border-radius: 50%;
            margin-right: 6px;
            vertical-align: middle;
          }

          .separator {
            width: 100%;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              var(--color-secondary),
              transparent
            );
            margin: 20px 0;
            border: none;
          }

          /* ========================================
             SELECCIÓN DE TEXTO
             ======================================== */
          ::selection {
            background-color: var(--color-secondary);
            color: var(--color-primary);
          }

          /* ========================================
             PRINT OPTIMIZATION
             ======================================== */
          @media print {
            body {
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .campo-monto {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: #fafafa !important;
            }

            .comparacion-texto {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: rgba(255, 214, 0, 0.06) !important;
            }

            .header {
              border-bottom-color: var(--color-secondary) !important;
            }

            .campo-monto {
              border-left-color: var(--color-secondary) !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- ====== HEADER ====== -->
        <div class="header">
          <p class="logo-ap">ap</p>
          <p class="logo-text">ANDRESPUBLICIDAD</p>
          <h1>Acta semanal de Validación y Cierre de Recargas</h1>
          <div class="periodo">
            Periodo de Revisión: <span class="linea-campo">${this.formatearFecha(acta.periodoInicio)}</span> 
            al <span class="linea-campo">${this.formatearFecha(acta.periodoFin)}</span> 
            de <span class="linea-campo">${formatMonth(acta.periodoFin)}</span> de ${acta.anio}
          </div>
        </div>

        <!-- ====== DESCRIPCIÓN ====== -->
        <div class="descripcion">
          <span class="accent-dot"></span>En la presente fecha, se procede a validar la correspondencia de los montos totales de las recargas.
        </div>

        <!-- ====== MONTOS PRINCIPALES ====== -->
        <div class="campo-monto">
          <strong><span class="accent-dot"></span>Total Requerido Proyectado:</strong> 
          <span>$ <span class="valor">${acta.totalRequeridoProyectado !== null ? formatMoney(acta.totalRequeridoProyectado).replace('$', '').trim() : '________________'}</span></span>
        </div>
        <div class="campo-monto">
          <strong><span class="accent-dot"></span>Total Ingresado a las Tarjetas:</strong> 
          <span>$ <span class="valor">${acta.totalIngresadoTarjetas !== null ? formatMoney(acta.totalIngresadoTarjetas).replace('$', '').trim() : '________________'}</span></span>
        </div>

        <!-- ====== SEPARADOR ====== -->
        <hr class="separator">

        <!-- ====== TEXTO COMPARACIÓN ====== -->
        <div class="comparacion-texto">
          Comparación entre los montos reportados por los pautadores mediante formulario y los 
          efectivamente debitados de las cuentas bancarias/tarjetas.
        </div>

        <!-- ====== MONTOS GOOGLE ADS ====== -->
        <div class="campo-monto">
          <strong><span class="accent-dot"></span>Total Recargado Google ADS:</strong> 
          <span>$ <span class="valor">${acta.totalRecargadoGoogleAds !== null ? formatMoney(acta.totalRecargadoGoogleAds).replace('$', '').trim() : '________________'}</span></span>
        </div>
        <div class="campo-monto">
          <strong><span class="accent-dot"></span>Total reportado en formularios de recarga:</strong> 
          <span>$ <span class="valor">${acta.totalReportadoFormularios !== null ? formatMoney(acta.totalReportadoFormularios).replace('$', '').trim() : '________________'}</span></span>
        </div>

        <!-- ====== SEPARADOR ====== -->
        <hr class="separator">

        <!-- ====== NOTA FINAL ====== -->
        <div class="nota">
          <span class="accent-dot"></span>Los montos arriba descritos deben coincidir al revisar y verificar las novedades de 
          activación, presupuestos y otras, en las cuentas correspondientes al periodo.
        </div>

        <!-- ====== FIRMAS ====== -->
        <div class="firmas">
          <div class="firma-row">
            <div class="firma-col">
              <p>Montos y novedades revisadas y certificadas por:</p>
              <div class="firma-linea">
                ${acta.firmaEmisorImagen ? `<img src="${acta.firmaEmisorImagen}" alt="Firma Emisor" class="firma-imagen">` : ''}
                <p class="firma-nombre">${acta.firmaEmisor || 'Alexandra Castrillón Arias'}</p>
                <p class="firma-cargo">Especialista ADS</p>
              </div>
            </div>
            <div class="firma-col" style="text-align: right;">
              <p>Recibido por:</p>
              <div class="firma-linea">
                ${acta.firmaRevisorImagen ? `<img src="${acta.firmaRevisorImagen}" alt="Firma Revisor" class="firma-imagen firma-imagen-right">` : ''}
                <p class="firma-nombre">${acta.firmaRevisor || 'Camila Burbano Muñoz'}</p>
                <p class="firma-cargo">Líder de Pauta o Encargado</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ====== FOOTER ====== -->
        <div class="footer-acta">
          📍 Pereira, Risaralda - Colombia &nbsp;&nbsp;|&nbsp;&nbsp; 📞 (+57) 324 234 1917 &nbsp;&nbsp;|&nbsp;&nbsp; ✉️ andrespublicidad@andrespublicidadtg.com
        </div>
      </body>
      </html>
    `;
  }
}
