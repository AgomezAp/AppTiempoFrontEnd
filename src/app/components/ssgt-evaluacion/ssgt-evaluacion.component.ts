import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-evaluacion.component.html',
  styleUrl: './ssgt-evaluacion.component.css',
})
export class SsgtEvaluacionComponent implements OnInit, OnDestroy {
  capacitacionId: number = 0;
  loading = true;
  evaluacion: any = null;
  preguntas: any[] = [];
  respuestas: { [key: number]: string } = {};
  enviando = false;

  resultado: any = null;
  mostrarResultado = false;

  tiempoLimite: number = 0;
  tiempoRestante: number = 0;
  timerInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ssgtService: SsgtService
  ) {}

  ngOnInit(): void {
    this.capacitacionId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (!this.capacitacionId) {
      this.router.navigate(['/ssgt-capacitaciones']);
      return;
    }
    this.cargarEvaluacion();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  cargarEvaluacion(): void {
    this.ssgtService.obtenerEvaluacion(this.capacitacionId).subscribe({
      next: (data) => {
        this.evaluacion = data;
        this.preguntas = data.preguntas || [];
        this.preguntas.forEach((p: any) => {
          this.respuestas[p.id] = '';
        });
        if (data.tiempoLimite) {
          this.tiempoLimite = data.tiempoLimite * 60;
          this.tiempoRestante = this.tiempoLimite;
          this.iniciarTimer();
        }
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', 'No se encontró la evaluación', 'error');
        this.router.navigate(['/ssgt-capacitaciones']);
      }
    });
  }

  iniciarTimer(): void {
    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        clearInterval(this.timerInterval);
        Swal.fire('Tiempo agotado', 'Se enviará la evaluación con las respuestas actuales', 'warning');
        this.enviarRespuestas();
      }
    }, 1000);
  }

  getMinutos(): number {
    return Math.floor(this.tiempoRestante / 60);
  }

  getSegundos(): number {
    return this.tiempoRestante % 60;
  }

  getOpciones(pregunta: any): string[] {
    try { return JSON.parse(pregunta.opciones); } catch { return []; }
  }

  getPreguntasRespondidas(): number {
    return Object.values(this.respuestas).filter(r => r && r.trim() !== '').length;
  }

  enviarRespuestas(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.enviando = true;
    const respuestasObj: { [key: string]: string } = {};
    Object.keys(this.respuestas).forEach(key => {
      respuestasObj[key] = this.respuestas[parseInt(key)];
    });

    this.ssgtService.responderEvaluacion(this.capacitacionId, respuestasObj).subscribe({
      next: (data) => {
        this.resultado = data;
        this.mostrarResultado = true;
        this.enviando = false;
      },
      error: () => {
        Swal.fire('Error', 'Error al enviar las respuestas', 'error');
        this.enviando = false;
      }
    });
  }

  volverACapacitaciones(): void {
    this.router.navigate(['/ssgt-capacitaciones']);
  }
}
