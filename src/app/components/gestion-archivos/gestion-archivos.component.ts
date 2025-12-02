import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchivoService } from '../../services/archivo.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-gestion-archivos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './gestion-archivos.component.html',
  styleUrls: ['./gestion-archivos.component.css']
})
export class GestionArchivosComponent implements OnInit {
  archivos: any[] = [];
  archivosFiltrados: any[] = [];
  archivoSeleccionado: File | null = null;
  nuevoArchivo = {
    nombre: '',
    descripcion: '',
    tipo: 'pdf',
    categoria: 'documentos'
  };
  esAdmin = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  categoriaActual = 'todas';
  archivoEditando: any = null;

  constructor(private archivoService: ArchivoService) {}

  ngOnInit() {
    this.verificarAdmin();
    this.cargarArchivos();
  }

  verificarAdmin() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.esAdmin = payload.role === 'Admin';
      } catch (e) {
        this.esAdmin = false;
      }
    }
  }

  cargarArchivos() {
    this.cargando = true;
    this.archivoService.getArchivos().subscribe({
      next: (response) => {
        this.archivos = response.archivos || [];
        this.archivosFiltrados = this.archivos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar archivos:', error);
        this.mostrarMensaje('Error al cargar archivos', 'error');
        this.cargando = false;
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaActual = categoria;
    
    if (categoria === 'todas') {
      this.cargarArchivos();
      return;
    }

    this.cargando = true;
    this.archivoService.getArchivosPorCategoria(categoria).subscribe({
      next: (response) => {
        this.archivosFiltrados = response.archivos || [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.mostrarMensaje('Error al filtrar archivos', 'error');
        this.cargando = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (100MB)
      if (file.size > 100 * 1024 * 1024) {
        this.mostrarMensaje('El archivo es muy grande. Máximo 100MB', 'error');
        event.target.value = '';
        return;
      }
      this.archivoSeleccionado = file;
      
      // Auto-detectar tipo
      if (file.type.includes('video')) {
        this.nuevoArchivo.tipo = 'video';
      } else if (file.type.includes('pdf')) {
        this.nuevoArchivo.tipo = 'pdf';
      } else if (file.type.includes('image')) {
        this.nuevoArchivo.tipo = 'imagen';
      } else {
        this.nuevoArchivo.tipo = 'documento';
      }
    }
  }

  subirArchivo(event: Event) {
    event.preventDefault();
    
    if (!this.archivoSeleccionado && !this.archivoEditando) {
      this.mostrarMensaje('Selecciona un archivo', 'error');
      return;
    }

    if (!this.nuevoArchivo.nombre.trim()) {
      this.mostrarMensaje('Ingresa un nombre para el archivo', 'error');
      return;
    }

    const formData = new FormData();
    if (this.archivoSeleccionado) {
      formData.append('file', this.archivoSeleccionado);
    }
    formData.append('nombre', this.nuevoArchivo.nombre);
    formData.append('descripcion', this.nuevoArchivo.descripcion);
    formData.append('tipo', this.nuevoArchivo.tipo);
    formData.append('categoria', this.nuevoArchivo.categoria);

    this.cargando = true;

    if (this.archivoEditando) {
      // Actualizar
      this.archivoService.updateArchivo(this.archivoEditando.Aid, formData).subscribe({
        next: (response) => {
          this.mostrarMensaje('Archivo actualizado exitosamente', 'success');
          this.cargarArchivos();
          this.resetForm();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.mostrarMensaje('Error al actualizar archivo. Verifica que seas administrador.', 'error');
          this.cargando = false;
        }
      });
    } else {
      // Crear nuevo
      this.archivoService.createArchivo(formData).subscribe({
        next: (response) => {
          this.mostrarMensaje('Archivo subido exitosamente', 'success');
          this.cargarArchivos();
          this.resetForm();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.mostrarMensaje('Error al subir archivo. Verifica que seas administrador.', 'error');
          this.cargando = false;
        }
      });
    }
  }

  verArchivo(archivo: any) {
    const url = this.archivoService.getFileUrl(archivo.url);
    window.open(url, '_blank');
  }

  editarArchivo(archivo: any) {
    this.archivoEditando = archivo;
    this.nuevoArchivo = {
      nombre: archivo.nombre,
      descripcion: archivo.descripcion || '',
      tipo: archivo.tipo,
      categoria: archivo.categoria
    };
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarArchivo(id: number, nombre: string) {
    if (!confirm(`¿Estás seguro de eliminar el archivo "${nombre}"?`)) {
      return;
    }

    this.cargando = true;
    this.archivoService.deleteArchivo(id).subscribe({
      next: () => {
        this.mostrarMensaje('Archivo eliminado exitosamente', 'success');
        this.cargarArchivos();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.mostrarMensaje('Error al eliminar archivo', 'error');
        this.cargando = false;
      }
    });
  }

  resetForm() {
    this.nuevoArchivo = {
      nombre: '',
      descripcion: '',
      tipo: 'pdf',
      categoria: 'documentos'
    };
    this.archivoSeleccionado = null;
    this.archivoEditando = null;
    
    // Limpiar input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 5000);
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'pdf': return '📄';
      case 'video': return '🎬';
      case 'imagen': return '🖼️';
      case 'documento': return '📋';
      default: return '📎';
    }
  }

  formatearFecha(fecha: any): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
