
export enum UserRole {
  GUEST = 'GUEST',
  HOST = 'HOST',
  SUPERADMIN = 'SUPERADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isOnline: boolean;
  isTyping?: boolean;
  idVerified: boolean;
  verificationDocUrl?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  hostId: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl: string;
  submittedAt: string;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  amenities: string[];
  maxGuests: number;
  status: 'available' | 'maintenance';
  taxRate: number;
  isWatchlisted?: boolean;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  taxAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  guestsCount: number;
  paymentId?: string;
}

export interface ChatThread {
  id: string;
  participantId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'doc';
  fileUrl?: string;
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBgImage: string;
  primaryColor: string;
  secondaryColor: string;
  enableSocialLogin: boolean;
  currency: 'USD' | 'EUR';
  language: 'en' | 'es';
  maintenanceMode: boolean;
  squareSandbox: boolean;
  squareAccessToken?: string;
  squareLocationId?: string;
}
