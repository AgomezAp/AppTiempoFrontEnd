import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SsgtService } from '../../services/ssgt.service';

@Component({
  selector: 'app-ssgt-documento-firmar',
  standalone: true,
  imports: [CommonModule],
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
  paginaImagenUrl: string = '';

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private hasSignature = false;

  constructor(
    private route: ActivatedRoute,
    private ssgtService: SsgtService
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

  ngAfterViewInit(): void {
    setTimeout(() => this.initCanvas(), 100);
  }

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
        if (this.documento && this.infoCampo) {
          this.paginaImagenUrl = this.ssgtService.obtenerPaginaImagen(
            this.documento.id,
            this.infoCampo.paginaNumero
          );
        }
        this.loading = false;
        setTimeout(() => this.initCanvas(), 100);
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
    this.hasSignature = false;
  }

  firmar(): void {
    if (!this.hasSignature) {
      alert('Por favor, firme en el recuadro antes de continuar');
      return;
    }
    this.firmando = true;
    const firmaBase64 = this.canvas.toDataURL('image/png');
    this.ssgtService.firmarDocumento(this.token, { firma: firmaBase64 }).subscribe({
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
