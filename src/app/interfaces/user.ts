export interface User {
  Uid?: number;
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  Rid?: number;
  Aid?: number;
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
  role?: {
    Rid: number;
    Rname: string;
  };
}
