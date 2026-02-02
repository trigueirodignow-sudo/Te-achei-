
export type Language = 'pt' | 'en' | 'es' | 'it';

export interface Review {
  id: string;
  userName: string;
  text: string;
  date: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  distance?: string;
  category: string;
  lat: number;
  lng: number;
  isPartner?: boolean;
  imageUrl?: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
  favoriteCount?: number;
  reviews?: Review[];
}

export interface RouteStep {
  instruction: string;
  distance?: string;
}

export interface Route {
  destination: string;
  totalDistance: string;
  totalDuration: string;
  steps: RouteStep[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  places?: Place[];
  route?: Route;
  isMapRequest?: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
