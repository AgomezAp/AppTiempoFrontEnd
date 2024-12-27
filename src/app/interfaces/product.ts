export enum ProductEstado {
    Excelente = 'excelente',
    Bueno = 'bueno',
    Defectuoso = 'defectuoso',
    Dañado = 'dañado',
    EnArreglo = 'en arreglo'
}


export interface Product{
    id: number;
    name: string;
    brand: string;
    category: string;
    quantity: number;
    estado: ProductEstado;
    qrCode?: string; 
}