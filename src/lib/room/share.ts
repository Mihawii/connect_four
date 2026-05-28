import type { Mode } from "@/lib/engine/types";

export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 5;

const ROOM_CODE_RE = /^[A-HJ-NP-Z2-9]{5}$/;

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_RE.test(normalizeRoomCode(code));
}

export function createRoomCode(random = Math.random): string {
  return Array.from({ length: ROOM_CODE_LENGTH }, () => {
    const index = Math.floor(random() * ROOM_CODE_ALPHABET.length);
    return ROOM_CODE_ALPHABET[index];
  }).join("");
}

export function roomPath(code: string, mode?: Mode): string {
  const safeCode = normalizeRoomCode(code);
  const suffix = mode ? `?mode=${mode}` : "";
  return `/room/${safeCode}${suffix}`;
}

export function roomShareUrl(origin: string, code: string, mode?: Mode): string {
  return new URL(roomPath(code, mode), origin).toString();
}
