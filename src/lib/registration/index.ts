/**
 * Utility functions for Registration Form handling
 * Includes validation, API calls, and data persistence
 */

export interface CustomerInfo {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  idType: 'cccd' | 'passport' | 'other';
  idNumber: string;
}

export interface AccommodationInfo {
  numberOfPeople: string;
  roomType: 'whole-room' | 'shared-room';
  rentalType: string;
  rentalDuration: string;
  desiredArea: string;
  priceRange: string;
  moveInDate: string;
}

export interface PreferenceInfo {
  quietHours?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  parkingRequired: boolean;
  acRequired: boolean;
  wifiRequired: boolean;
  kitchenRequired: boolean;
  gymRequired: boolean;
  laundryRequired: boolean;
  securityRequired: boolean;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
}

export interface RegistrationData extends CustomerInfo, AccommodationInfo {
  preferences?: PreferenceInfo;
  notes?: string;
}

export interface RegistrationResponse {
  id: string;
  registrationNumber: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  data: RegistrationData;
}

/**
 * Generate registration number in format: REG-YYYYMMDD-XXXXX
 */
export function generateRegistrationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  
  return `REG-${year}${month}${day}-${random}`;
}

/**
 * Create a new registration record
 * In real application, this would call your backend API
 */
export async function createRegistration(data: RegistrationData): Promise<RegistrationResponse> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response: RegistrationResponse = {
      id: Math.random().toString(36).substr(2, 9),
      registrationNumber: generateRegistrationNumber(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data,
    };

    // In real app:
    // const response = await fetch('/api/registrations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // }).then(res => res.json());

    return response;
  } catch (error) {
    throw new Error('Failed to create registration: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Save registration as draft
 */
export async function saveRegistrationDraft(data: RegistrationData): Promise<RegistrationResponse> {
  try {
    // Save to localStorage for now
    const draft = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('registration-draft', JSON.stringify(draft));

    const response: RegistrationResponse = {
      id: 'draft-temp',
      registrationNumber: 'DRAFT',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data,
    };

    return response;
  } catch (error) {
    throw new Error('Failed to save draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Load registration draft
 */
export function loadRegistrationDraft(): RegistrationData | null {
  try {
    const draft = localStorage.getItem('registration-draft');
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear registration draft
 */
export function clearRegistrationDraft(): void {
  localStorage.removeItem('registration-draft');
}

/**
 * Validate phone number format (Vietnam)
 */
export function isValidPhoneNumber(phone: string): boolean {
  return /^[0-9]{10,11}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Format price range to display text
 */
export function formatPriceRange(range: string): string {
  const ranges: Record<string, string> = {
    '1-3m': '1 - 3 triệu VNĐ',
    '3-5m': '3 - 5 triệu VNĐ',
    '5-7m': '5 - 7 triệu VNĐ',
    '7-10m': '7 - 10 triệu VNĐ',
    '10m+': '> 10 triệu VNĐ',
  };
  return ranges[range] || range;
}

/**
 * Format rental type to display text
 */
export function formatRentalType(type: string): string {
  const types: Record<string, string> = {
    'short-term': 'Thuê ngắn hạn',
    'long-term': 'Thuê dài hạn',
    'semester': 'Thuê theo học kỳ',
    'yearly': 'Thuê theo năm',
  };
  return types[type] || type;
}

/**
 * Format area name
 */
export function formatArea(area: string): string {
  const areas: Record<string, string> = {
    'area-a': 'Khu vực A',
    'area-b': 'Khu vực B',
    'area-c': 'Khu vực C',
    'area-d': 'Khu vực D',
  };
  return areas[area] || area;
}

/**
 * Get preference label by id
 */
export function getPreferenceLabel(id: string): string {
  const preferences: Record<string, string> = {
    'wifi': 'WiFi miễn phí',
    'ac': 'Điều hòa',
    'water-heater': 'Nước nóng',
    'kitchen': 'Bếp chung',
    'gym': 'Phòng tập',
    'parking': 'Chỗ để xe',
    'laundry': 'Giặt sấy',
    'security': 'Bảo vệ 24/7',
  };
  return preferences[id] || id;
}
