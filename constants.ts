
import { Property, UserRole, User, SiteConfig } from './types';

export const INITIAL_SITE_CONFIG: SiteConfig = {
  siteName: "Havenly",
  heroTitle: "Experimenta el lugar perfecto",
  heroSubtitle: "Descubre alojamientos únicos y vive experiencias inolvidables en los destinos más increíbles",
  heroBgImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop",
  primaryColor: "#ec4899", // pink-500
  secondaryColor: "#6366f1", // indigo-600
  enableSocialLogin: true,
  currency: 'USD',
  language: 'es',
  maintenanceMode: false,
  squareSandbox: true,
};

export const MOCK_USERS: User[] = [
  { 
    id: 'u-admin', 
    name: 'Master Admin', 
    email: 'admin@vacationrentals.com', 
    password: 'A-Strong-P@ss123!',
    role: UserRole.SUPERADMIN, 
    avatar: 'https://i.pravatar.cc/150?u=admin', 
    isOnline: true, 
    idVerified: true 
  },
  { 
    id: 'u-host', 
    name: 'Host Manager', 
    email: 'hostmanager@vacationrentals.com', 
    password: 'H-Manager-P@ss123!',
    role: UserRole.HOST, 
    avatar: 'https://i.pravatar.cc/150?u=host', 
    isOnline: true, 
    idVerified: true 
  },
  { 
    id: 'u-guest', 
    name: 'Test Guest', 
    email: 'testuser@vacationrentals.com', 
    password: 'T-User-P@ss123!',
    role: UserRole.GUEST, 
    avatar: 'https://i.pravatar.cc/150?u=guest', 
    isOnline: true, 
    idVerified: false 
  },
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    hostId: 'u-host',
    title: 'Villa Moderna con Vista al Mar',
    description: 'Hermosa villa con impresionantes vistas al océano, piscina privada y todas las comodidades modernas.',
    pricePerNight: 250,
    location: 'Marbella, España',
    category: 'Villa',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 127,
    amenities: ['WiFi', 'Piscina', 'Aire Acondicionado', 'Cocina', 'TV', 'Parking'],
    maxGuests: 4,
    status: 'available',
    taxRate: 0.0625
  },
  {
    id: 'p2',
    hostId: 'u-host',
    title: 'Apartamento Céntrico de Lujo',
    description: 'Elegante apartamento en el corazón de la ciudad, cerca de los mejores restaurantes y museos.',
    pricePerNight: 180,
    location: 'Madrid, España',
    category: 'Apartamento',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 89,
    amenities: ['WiFi', 'Aire Acondicionado', 'Cocina'],
    maxGuests: 2,
    status: 'available',
    taxRate: 0.0625
  }
];

export const CATEGORIES = ['Todos', 'Villa', 'Apartamento', 'Casa', 'Cabaña'];
