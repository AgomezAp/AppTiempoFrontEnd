import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SsgtService } from '../../services/ssgt.service';

@Component({
  selector: 'app-ssgt-documento-firmar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ssgt-documento-firmar.component.html',
  styleUrl: './ssgt-documento-firmar.component.css',
})
export class SsgtDocumentoFirmarComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  token: string = '';
  loading = true;
  error: string | null = null;
  success = false;
  firmando = false;
  yaFirmado = false;

  infoCampo: any = null;
  documento: any = null;

  // Page navigation
  paginaActual = 1;

  // Modal
  mostrarModal = false;

  // Canvas
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  hasSignature = false;

  // Signature method
  metodoFirma: 'dibujar' | 'subir' | 'escribir' = 'dibujar';
  firmaImagenPreview: string | null = null;

  // Color
  colorFirma = '#000000';
  coloresDisponibles = ['#000000', '#1a237e', '#b71c1c'];

  // Text signature
  textoFirma = '';
  fuenteSeleccionada = '';
  fuentesDisponibles = [
    { nombre: 'Brush Script MT, cursive', label: 'Elegante' },
    { nombre: 'Segoe Script, cursive', label: 'Casual' },
    { nombre: 'Lucida Handwriting, cursive', label: 'Manuscrita' },
    { nombre: 'Comic Sans MS, cursive', label: 'Informal' },
    { nombre: 'Courier New, monospace', label: 'Clásica' },
  ];
  firmaGenerada: string | null = null;

  // Stores the final base64 to submit
  firmaBase64Final: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ssgtService: SsgtService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error = 'Token invalido';
      this.loading = false;
      return;
    }
    this.cargarInfoFirma();
  }

  ngAfterViewInit(): void {}

  cargarInfoFirma(): void {
    this.ssgtService.obtenerInfoFirmaDocumento(this.token).subscribe({
      next: (data: any) => {
        if (data.firmado) {
          this.yaFirmado = true;
          this.error = 'Este documento ya ha sido firmado';
          this.loading = false;
          return;
        }
        this.infoCampo = data;
        this.documento = data.documento;
        this.loading = false;
      },
      error: (err: any) => {
        if (err.error?.firmado || err.status === 400) {
          this.yaFirmado = true;
        }
        this.error = err.error?.msg || 'Error al cargar informacion de firma';
        this.loading = false;
      },
    });
  }

  // --- Page navigation ---

  getPaginaUrl(pagina: number): string {
    if (!this.documento) return '';
    return this.ssgtService.obtenerPaginaImagen(this.documento.id, pagina);
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  paginaSiguiente(): void {
    if (this.documento && this.paginaActual < this.documento.totalPaginas) {
      this.paginaActual++;
    }
  }

  // --- Modal ---

  abrirModal(): void {
    this.mostrarModal = true;
    if (this.metodoFirma === 'dibujar') {
      setTimeout(() => this.initCanvas(), 100);
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  usarFirma(): void {
    let firma: string | null = null;

    if (this.metodoFirma === 'dibujar' && this.canvas) {
      firma = this.canvas.toDataURL('image/png');
    } else if (this.metodoFirma === 'subir') {
      firma = this.firmaImagenPreview;
    } else if (this.metodoFirma === 'escribir') {
      firma = this.firmaGenerada;
    }

    if (!firma) return;

    this.firmaBase64Final = firma;
    this.hasSignature = true;
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  // --- Canvas drawing ---

  initCanvas(): void {
    if (!this.canvasRef) return;
    this.canvas = this.canvasRef.nativeElement;
    const context = this.canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;
    this.resizeCanvas();
    this.setupCanvas();
  }

  resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth - 4;
      this.canvas.height = 200;
    }
    this.setupCanvas();
  }

  setupCanvas(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.colorFirma;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.canvas && this.mostrarModal && this.metodoFirma === 'dibujar' && !this.hasSignature) {
      this.resizeCanvas();
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.startDrawing(event.offsetX, event.offsetY);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing) return;
    this.draw(event.offsetX, event.offsetY);
  }

  onMouseUp(): void { this.stopDrawing(); }
  onMouseLeave(): void { this.stopDrawing(); }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing) return;
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.draw(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  onTouchEnd(): void { this.stopDrawing(); }

  private startDrawing(x: number, y: number): void {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
  }

  private draw(x: number, y: number): void {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
    this.hasSignature = true;
  }

  private stopDrawing(): void { this.isDrawing = false; }

  limpiarFirma(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.colorFirma;
    this.hasSignature = false;
    this.firmaBase64Final = null;
  }

  // --- Color ---

  cambiarColor(color: string): void {
    this.colorFirma = color;
    if (this.ctx) {
      this.ctx.strokeStyle = color;
    }
  }

  cambiarColorTexto(color: string): void {
    this.colorFirma = color;
    if (this.fuenteSeleccionada) {
      this.generarFirmaTexto(this.fuenteSeleccionada);
    }
  }

  // --- Method switching ---

  cambiarMetodo(metodo: 'dibujar' | 'subir' | 'escribir'): void {
    this.metodoFirma = metodo;
    if (metodo === 'dibujar') {
      this.hasSignature = false;
      setTimeout(() => this.initCanvas(), 100);
    } else if (metodo === 'subir') {
      this.hasSignature = !!this.firmaImagenPreview;
    } else if (metodo === 'escribir') {
      this.hasSignature = !!this.firmaGenerada;
    }
  }

  // --- Upload image ---

  onImagenFirmaSeleccionada(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.firmaImagenPreview = e.target.result;
      this.hasSignature = true;
    };
    reader.readAsDataURL(file);
  }

  limpiarImagenFirma(): void {
    this.firmaImagenPreview = null;
    this.hasSignature = false;
    this.firmaBase64Final = null;
  }

  // --- Text signature ---

  onTextoFirmaChange(): void {
    if (this.fuenteSeleccionada) {
      this.generarFirmaTexto(this.fuenteSeleccionada);
    }
  }

  generarFirmaTexto(fuente: string): void {
    this.fuenteSeleccionada = fuente;
    const texto = this.textoFirma || this.infoCampo.nombreFirmante || this.infoCampo.emailFirmante;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Auto-scale: start large and shrink until text fits with padding
    const maxWidth = canvas.width - 40;
    let fontSize = 120;
    ctx.font = `${fontSize}px ${fuente}`;
    while (ctx.measureText(texto).width > maxWidth && fontSize > 16) {
      fontSize -= 2;
      ctx.font = `${fontSize}px ${fuente}`;
    }

    ctx.fillStyle = this.colorFirma;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
    this.firmaGenerada = canvas.toDataURL('image/png');
    this.hasSignature = true;
  }

  // --- Submit ---

  firmar(): void {
    if (!this.hasSignature || !this.firmaBase64Final) {
      alert('Por favor, proporcione su firma y presione "Usar esta firma" en el modal');
      return;
    }
    this.firmando = true;
    this.ssgtService.firmarDocumento(this.token, { firma: this.firmaBase64Final }).subscribe({
      next: () => {
        this.success = true;
        this.firmando = false;
      },
      error: (err: any) => {
        alert(err.error?.msg || 'Error al registrar la firma');
        this.firmando = false;
      },
    });
  }
}
