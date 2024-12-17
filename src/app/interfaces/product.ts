export interface Product{
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number; // Asegúrate de que la propiedad 'price' esté definida
    quantity: number;
    qrCode?: string; 
}