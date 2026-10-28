export type Role = 'DONOR' | 'RECIPIENT' | 'ADMIN';

export type FoodCategory = 
  | 'COOKED_MEALS' 
  | 'BAKERY' 
  | 'PRODUCE' 
  | 'DAIRY' 
  | 'PACKAGED_GOODS' 
  | 'OTHER';

export type ListingStatus = 
  | 'AVAILABLE' 
  | 'REQUESTED' 
  | 'CONFIRMED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export type RequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  organizationType?: string;
  registrationNumber?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface Listing {
  id: string;
  donorId: string;
  donor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
    organizationType?: string;
  };
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  dietaryInfo?: string;
  preparedAt?: string;
  useBy: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  pickupAddress: string;
  pickupCity: string;
  storageInstructions?: string;
  foodSafetyConfirmed: boolean;
  status: ListingStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  requests?: DonationRequest[];
  _count?: {
    requests: number;
  };
}

export interface DonationRequest {
  id: string;
  listingId: string;
  listing: Listing;
  recipientId: string;
  recipient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    organizationType?: string;
    city?: string;
    isVerified?: boolean;
  };
  status: RequestStatus;
  requestedQuantity: number;
  pickupTime?: string;
  purpose?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  totalFoodRescuedKg: number;
  totalMealsRescued: number;
  totalCO2AvoidedKg: number;
  totalCompletedDonations: number;
  totalActiveListings: number;
  totalDonors: number;
  totalRecipients: number;
  totalUsers: number;
  categoryBreakdown: { category: string; count: number }[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
