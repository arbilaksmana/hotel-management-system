import type { RoomOperationalStatus } from "./status";
import type { Role } from "./role";

export interface Hotel {
  id: string;
  code: string;
  name: string;
  city: string;
  timezone: string;
  isHeadOffice?: boolean;
}

export interface RoomType {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  capacity: number;
  baseRate: number; // per malam, IDR
  amenities: string[];
}

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  number: string;
  floor: number;
  operationalStatus: RoomOperationalStatus;
  active: boolean;
}

export interface RatePlan {
  id: string;
  hotelId: string;
  roomTypeId: string;
  name: string;
  channel: string;
  pricePerNight: number;
  mealPlan?: string;
}

export type ChannelKind = "WALK_IN" | "PHONE" | "WHATSAPP" | "WEBSITE" | "OTA" | "CORPORATE" | "TRAVEL_AGENT";

export interface Guest {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  idType?: "KTP" | "PASSPORT" | "SIM";
  idNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  hotelId?: string; // undefined = Head Office / lintas cabang
  requiresTwoFactor?: boolean;
}
