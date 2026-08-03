import { rooms } from "@/data/seed";
import type { Payment, Room } from "@/domain/types";
import type { AvailabilityService, HotelService } from "../contracts";
import { store } from "./store";
import { delay } from "./util";

export const roomService: HotelService = {
  async listRooms(hotelId: string): Promise<Room[]> {
    await delay(60);
    return rooms.filter((r) => r.hotelId === hotelId);
  },
};

export const availabilityService: AvailabilityService = {
  async getInventory(hotelId, from, to) {
    await delay(60);
    return store.inventory.filter((i) => i.hotelId === hotelId && i.date >= from && i.date <= to);
  },
};

export async function listPendingPayments(hotelId: string): Promise<Payment[]> {
  await delay(60);
  return store.payments.filter((p) => p.hotelId === hotelId && p.status === "PENDING");
}
