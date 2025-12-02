export interface NominaConfig {
  id?: number;
  salarioMinimo: number;
  auxilioTransporte: number;
  porcentajeSalud: number;
  porcentajePension: number;
  anio: number;
  vigente: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
