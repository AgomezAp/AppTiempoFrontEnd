export interface User{
    name?: string,
    lastName?:string,
    email:string,
    password:string,
    Rid?:number
}

export interface UResponse{
    Uid?: number; 
    name: string;
    lastName: string;
    email: string;
    password?: string; 
    status?: number;
    Rid: number;
    role?: {
      Rid: number;
      Rname: string;
    }; 
}

