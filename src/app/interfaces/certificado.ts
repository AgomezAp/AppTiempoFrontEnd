export interface Certificado {
  empresa: string;
  nit: string;
  nombreCompleto: string;
  documentoIdentificacion: string;
  cargo: string;
  fechaIngreso: string;
  salario: string;
  salarioEnPalabras: string;
  fechaCertificado: string;
  gerente: string;
  lider: string;
  cargoLider: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string;
  tipoContrato: string;
}

export interface CertificadoResponse {
  message: string;
  certificado: Certificado;
}
