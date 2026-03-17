export interface User {
  Uid?: number;
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  Rid?: number;
  Aid?: number;
  salario?: number;
  empresa?: 'AP' | 'AT' | 'ME';
  documentoIdentificacion?: string;
  cargo?: string;
  tipoContrato?: 'termino-indefinido' | 'termino-fijo';
  fondoPension?: string;
  fondoCesantias?: string;
  certificadosGenerados?: number;
  fechaIngreso?: string;
  celular?: string;
}

export interface UResponse {
  Uid?: number;
  name: string;
  lastName: string;
  email: string;
  password?: string;
  status?: number;
  Rid: number;
  Aid: number;
  salario?: number;
  empresa?: 'AP' | 'AT' | 'ME';
  documentoIdentificacion?: string;
  cargo?: string;
  tipoContrato?: 'termino-indefinido' | 'termino-fijo';
  fondoPension?: string;
  fondoCesantias?: string;
  certificadosGenerados?: number;
  fechaIngreso?: string;
  celular?: string;
  role?: {
    Rid: number;
    Rname: string;
  };
}
