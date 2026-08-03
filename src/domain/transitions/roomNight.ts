import type { RoomNightStatus } from "../types/status";

const ALLOWED: Record<RoomNightStatus, RoomNightStatus[]> = {
  AVAILABLE: ["HELD", "BOOKED", "BLOCKED"],
  HELD: ["AVAILABLE", "BOOKED", "BLOCKED"],
  BOOKED: ["OCCUPIED", "AVAILABLE", "BLOCKED"],
  OCCUPIED: ["AVAILABLE", "BLOCKED"],
  BLOCKED: ["AVAILABLE"],
};

export function canTransitionRoomNight(from: RoomNightStatus, to: RoomNightStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}
