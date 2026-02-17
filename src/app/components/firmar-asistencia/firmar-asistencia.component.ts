import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AsistenciaService } from '../../services/asistencia.service';
import { InfoFirmaResponse } from '../../interfaces/asistencia';

@Component({
  selector: 'app-firmar-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firmar-asistencia.component.html',
  styleUrl: './firmar-asistencia.component.css',
})
export class FirmarAsistenciaComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  token: string = '';
  loading = true;
  error: string | null = null;
  success = false;
  firmando = false;

  infoFirma: InfoFirmaResponse | null = null;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private hasSignature = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asistenciaService: AsistenciaService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error = 'Token inválido';
      this.loading = false;
      return;
    }
    this.cargarInfoFirma();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCanvas(), 100);
  }

  cargarInfoFirma(): void {
    this.asistenciaService.obtenerInfoFirma(this.token).subscribe({
      next: (data) => {
        this.infoFirma = data;
        this.loading = false;
        setTimeout(() => this.initCanvas(), 100);
      },
      error: (err) => {
        this.error = err.error?.msg || 'Error al cargar información';
        this.loading = false;
      },
    });
  }

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
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.canvas && !this.hasSignature) {
      this.resizeCanvas();
    }
  }

  // Mouse events
  onMouseDown(event: MouseEvent): void {
    this.startDrawing(event.offsetX, event.offsetY);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing) return;
    this.draw(event.offsetX, event.offsetY);
  }

  onMouseUp(): void {
    this.stopDrawing();
  }

  onMouseLeave(): void {
    this.stopDrawing();
  }

  // Touch events
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

  onTouchEnd(): void {
    this.stopDrawing();
  }

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

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  limpiarFirma(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.hasSignature = false;
  }

  getSignatureBase64(): string {
    return this.canvas.toDataURL('image/png');
  }

  firmar(): void {
    if (!this.hasSignature) {
      alert('Por favor, firme en el recuadro antes de continuar');
      return;
    }

    this.firmando = true;
    const firmaBase64 = this.getSignatureBase64();

    this.asistenciaService.firmarAsistencia(this.token, { firma: firmaBase64 }).subscribe({
      next: (response) => {
        this.success = true;
        this.firmando = false;
      },
      error: (err) => {
        alert(err.error?.msg || 'Error al registrar la firma');
        this.firmando = false;
      },
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getEmpresaNombre(empresa: string): string {
    switch (empresa) {
      case 'AP':
        return 'Andrés Publicidad';
      case 'AT':
        return 'Andrés Tobón';
      case 'ME':
        return 'María Evangelina';
      default:
        return empresa;
    }
  }
}
