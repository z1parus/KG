import type { Currency } from "./money";

export interface WorkingHours {
  from: string;
  to: string;
}

export interface DeliveryZone {
  name: string;
  minOrder: number;
  deliveryFee: number;
  estimatedTime: number;
}

export interface Restaurant {
  id: string;
  name: string;
  phone: string;
  isOpen: boolean;
  workingHours: WorkingHours;
  deliveryZones: DeliveryZone[];
  pickupEnabled: boolean;
  currency: Currency;
  address: string;
}
