import { COLS, ROWS } from "@/lib/engine/types";

export const SLOT_SIZE = 1;
export const BOARD_WIDTH = COLS * SLOT_SIZE;
export const BOARD_HEIGHT = ROWS * SLOT_SIZE;
export const FRAME_PAD = 0.6;
export const FRAME_WIDTH = BOARD_WIDTH + FRAME_PAD * 2;
export const FRAME_HEIGHT = BOARD_HEIGHT + FRAME_PAD * 2;
export const BOARD_THICKNESS = 0.5;

export const DISC_RADIUS = SLOT_SIZE * 0.42;
export const DISC_THICKNESS = SLOT_SIZE * 0.22;

export const PLAYER_COLOR_HEX: Record<1 | 2, string> = {
  1: "#FF5722",
  2: "#F2C94C",
};

export const PLAYER_COLOR_HOT: Record<1 | 2, string> = {
  1: "#FFC1A6",
  2: "#FFF3CC",
};

export const PLAYER_LABEL: Record<1 | 2, string> = {
  1: "Ember",
  2: "Flare",
};

export function slotToWorld(col: number, row: number): [number, number, number] {
  const x = (col - (COLS - 1) / 2) * SLOT_SIZE;
  const y = (row - (ROWS - 1) / 2) * SLOT_SIZE;
  return [x, y, 0];
}
