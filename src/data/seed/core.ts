import type { Hotel, Room, RoomType, RatePlan, User, Guest, PolicyConfig } from "@/domain/types";
import { DISCOUNT_LIMITS } from "@/domain/permissions/discount";

export const HOTEL_ID = "htl-bandung-01";

export const hotels: Hotel[] = [
  { id: HOTEL_ID, code: "BDG-01", name: "Hotel Arjuna Bandung", city: "Bandung", timezone: "Asia/Jakarta" },
];

export const roomTypes: RoomType[] = [
  { id: "rt-std", hotelId: HOTEL_ID, code: "STD", name: "Standard", capacity: 2, baseRate: 450_000, amenities: ["WiFi", "TV", "AC"] },
  { id: "rt-dlx", hotelId: HOTEL_ID, code: "DLX", name: "Deluxe", capacity: 2, baseRate: 650_000, amenities: ["WiFi", "TV", "AC", "Sarapan"] },
  { id: "rt-ste", hotelId: HOTEL_ID, code: "STE", name: "Suite", capacity: 4, baseRate: 1_100_000, amenities: ["WiFi", "TV", "AC", "Sarapan", "Bathtub"] },
];

export const ratePlans: RatePlan[] = [
  { id: "rp-std-rack", hotelId: HOTEL_ID, roomTypeId: "rt-std", name: "Rack Rate", channel: "WALK_IN", pricePerNight: 450_000 },
  { id: "rp-dlx-rack", hotelId: HOTEL_ID, roomTypeId: "rt-dlx", name: "Rack Rate", channel: "WALK_IN", pricePerNight: 650_000 },
  { id: "rp-ste-rack", hotelId: HOTEL_ID, roomTypeId: "rt-ste", name: "Rack Rate", channel: "WALK_IN", pricePerNight: 1_100_000 },
  { id: "rp-std-ota", hotelId: HOTEL_ID, roomTypeId: "rt-std", name: "OTA Promo", channel: "OTA", pricePerNight: 410_000 },
  { id: "rp-dlx-corp", hotelId: HOTEL_ID, roomTypeId: "rt-dlx", name: "Corporate", channel: "CORPORATE", pricePerNight: 595_000 },
];

const mkRoom = (n: string, floor: number, rt: string, op: Room["operationalStatus"] = "CLEAN"): Room => ({
  id: `rm-${n}`,
  hotelId: HOTEL_ID,
  roomTypeId: rt,
  number: n,
  floor,
  operationalStatus: op,
  active: true,
});

export const rooms: Room[] = [
  mkRoom("101", 1, "rt-std"), mkRoom("102", 1, "rt-std"), mkRoom("103", 1, "rt-std", "DIRTY"),
  mkRoom("104", 1, "rt-std"), mkRoom("105", 1, "rt-dlx"),
  mkRoom("201", 2, "rt-dlx"), mkRoom("202", 2, "rt-dlx"), mkRoom("203", 2, "rt-dlx", "CLEANING"),
  mkRoom("204", 2, "rt-dlx"), mkRoom("205", 2, "rt-dlx", "INSPECTED"),
  mkRoom("301", 3, "rt-ste"), mkRoom("302", 3, "rt-ste"), mkRoom("303", 3, "rt-ste", "MAINTENANCE"),
  mkRoom("304", 3, "rt-ste"), mkRoom("305", 3, "rt-std", "OUT_OF_ORDER"),
];

export const users: User[] = [
  { id: "u-resepsionis", name: "Sari Wulandari", email: "sari@hotel.test", role: "RECEPTIONIST", hotelId: HOTEL_ID },
  { id: "u-kasir", name: "Rian Prakoso", email: "rian@hotel.test", role: "CASHIER", hotelId: HOTEL_ID },
  { id: "u-fo-supervisor", name: "Dewi Lestari", email: "dewi@hotel.test", role: "FRONT_OFFICE_SUPERVISOR", hotelId: HOTEL_ID },
  { id: "u-manager", name: "Bambang Hartono", email: "bambang@hotel.test", role: "HOTEL_MANAGER", hotelId: HOTEL_ID, requiresTwoFactor: true },
  { id: "u-finance", name: "Mega Kusuma", email: "mega@hotel.test", role: "FINANCE_HOTEL", hotelId: HOTEL_ID },
  { id: "u-hk", name: "Joko Santoso", email: "joko@hotel.test", role: "HOUSEKEEPING", hotelId: HOTEL_ID },
  { id: "u-eng", name: "Agus Riyanto", email: "agus@hotel.test", role: "ENGINEERING", hotelId: HOTEL_ID },
  { id: "u-ho-approver", name: "Citra Maharani", email: "citra@ho.test", role: "HEAD_OFFICE_APPROVER" },
  { id: "u-owner", name: "Pak Owner", email: "owner@ho.test", role: "OWNER" },
];

export const guests: Guest[] = [
  { id: "g-01", fullName: "Andi Saputra", phone: "0812-1111-0001", email: "andi@mail.test", idType: "KTP", idNumber: "3273xxxx0001" },
  { id: "g-02", fullName: "Rina Marlina", phone: "0812-1111-0002", email: "rina@mail.test", idType: "KTP", idNumber: "3273xxxx0002" },
  { id: "g-03", fullName: "Farhan Alwi", phone: "0812-1111-0003" }, // identitas belum lengkap (untuk skenario check-in blocker)
  { id: "g-04", fullName: "PT Nusantara Jaya", phone: "022-555-0100", email: "ap@nusantara.test" },
  { id: "g-05", fullName: "Siti Rahma", phone: "0812-1111-0005", email: "siti@mail.test", idType: "KTP", idNumber: "3273xxxx0005" },
];

export const policy: PolicyConfig = {
  hotelId: HOTEL_ID,
  dpPercent: 0.3,
  dpMinOneNight: true,
  holdMinutesOnline: 30,
  holdMinutesFrontOffice: 120,
  holdMinutesApproval: 120,
  checkInTime: "14:00",
  checkOutTime: "12:00",
  inspectionRequired: false,
  discountLimits: DISCOUNT_LIMITS,
};
